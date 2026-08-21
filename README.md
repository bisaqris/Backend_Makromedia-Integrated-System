# Makromedia Integrated System - Backend

REST API untuk **Sistem Manajemen Proyek Terintegrasi** milik **CV. Makromedia Visual** - agensi
kreatif yang menangani *event*, *corporate video*, *film production*, dan *wedding*. Sistem ini
menyatukan alur kerja end-to-end mulai dari akuisisi proyek, penawaran (quotation), penagihan
(invoice), pencatatan biaya produksi dengan *approval workflow*, manajemen manpower, hingga pemantauan
progress - seluruhnya diproteksi dengan autentikasi JWT dan **Role-Based Access Control (RBAC)**.

Backend dibangun mengikuti *Software Design Document* (SDD) dengan pendekatan **database-first**,
arsitektur **modular** ala NestJS, dan objek database native PostgreSQL (view, function, procedure,
trigger, constraint).

> Frontend (Next.js) berada di repositori terpisah:
> [Frontend_Makromedia-Integrated-System](https://github.com/bisaqris/Frontend_Makromedia-Integrated-System).

---

## Daftar Isi

1. [Fitur Utama](#fitur-utama)
2. [Tech Stack](#tech-stack)
3. [Arsitektur & Metode](#arsitektur--metode)
4. [Use Case Diagram](#use-case-diagram)
5. [Sequence Diagram](#sequence-diagram)
6. [Alur Sistem](#alur-sistem)
7. [Model Data (ERD)](#model-data-erd)
8. [RBAC (Matriks Hak Akses)](#rbac-matriks-hak-akses)
9. [Referensi API / Endpoint](#referensi-api--endpoint)
10. [Format Response & Error](#format-response--error)
11. [Objek Database](#objek-database)
12. [Keamanan (Security Hardening)](#keamanan-security-hardening)
13. [Struktur Folder](#struktur-folder)
14. [Prasyarat & Instalasi](#prasyarat--instalasi)
15. [Environment Variables](#environment-variables)
16. [Script NPM](#script-npm)
17. [Alur Git (Git Flow)](#alur-git-git-flow)
18. [Akun Demo](#akun-demo)

---

## Fitur Utama

| Domain | Ringkasan |
| ------ | --------- |
| **Autentikasi** | Login email + password, JWT Bearer, endpoint `me`, guard global + rate limiting anti brute-force. |
| **User Management** | CRUD user & assignment role (khusus Direktur). |
| **Client Data** | Data perusahaan klien (Company Client) & PIC (Client), soft-delete. |
| **Manpower** | Data tenaga kerja/kru produksi beserta skill, rate, dan info bank. |
| **Project** | CRUD proyek, kategori, kontrak, timeline, PM assignment, scoping data per role. |
| **Quotation** | Penawaran multi-item dengan diskon & pajak, auto-kalkulasi subtotal & total. |
| **Invoice** | Penagihan multi-item, dapat diturunkan dari quotation, update status pembayaran. |
| **Production Cost** | Pencatatan biaya + **approval workflow** (submit → approve/reject oleh Direktur). |
| **Calendar** | Agregasi event proyek (turunan, tidak dipersistensi). |
| **Health Check** | Status aplikasi, latensi database, dan penggunaan memori. |

---

## Tech Stack

| Lapisan | Teknologi | Versi |
| ------- | --------- | ----- |
| **Runtime** | Node.js | ≥ 20 |
| **Framework** | [NestJS](https://nestjs.com/) (modular, DI, decorator) | 11.1.x |
| **Bahasa** | TypeScript | 5.9.x |
| **ORM** | [Prisma](https://www.prisma.io/) | 6.19.x |
| **Database** | PostgreSQL | 16 |
| **Autentikasi** | JWT (`@nestjs/jwt`) · Passport (`passport-jwt`) | 11.x / 4.x |
| **Password Hashing** | bcryptjs (cost factor 12) | 3.x |
| **Validasi** | class-validator · class-transformer | 0.15.x / 0.5.x |
| **Keamanan** | helmet · `@nestjs/throttler` (rate limit) · CORS whitelist | 8.x / 6.x |
| **Performa** | compression (gzip) | 1.8.x |
| **Dokumentasi API** | Swagger / OpenAPI (`@nestjs/swagger`) | 11.x |
| **Reactive** | RxJS | 7.8.x |
| **Package Manager** | pnpm | 11.x |

---

## Arsitektur & Metode

**Metodologi & prinsip yang diterapkan:**

- **Database-first** - `schema.prisma` adalah *single source of truth*; objek SQL kustom
  (view/function/procedure/trigger) diterapkan via script.
- **Modular architecture** - tiap domain adalah *feature module* (controller → service → Prisma),
  dependency injection, dan pemisahan tanggung jawab (SoC).
- **Cross-cutting concerns** ditangani terpusat via **Guard**, **Interceptor**, dan **Filter** global.
- **Defense in depth** - validasi input, RBAC, rate limiting, security headers, dan fail-fast env
  validation berlapis.

```mermaid
flowchart TB
    Client["Client / Frontend (Next.js)"] -->|HTTPS + JWT| MW

    subgraph NestJS["NestJS Application (port 4000, prefix /api)"]
        direction TB
        MW["Middleware: helmet · compression · CORS"]
        MW --> GUARD
        subgraph GUARD["Global Guards (urutan)"]
            direction LR
            T["ThrottlerGuard\n(rate limit)"] --> J["JwtAuthGuard\n(autentikasi)"] --> R["RolesGuard\n(otorisasi RBAC)"]
        end
        GUARD --> PIPE["ValidationPipe\n(whitelist + transform)"]
        PIPE --> CTRL["Controllers\n(auth, users, projects, ...)"]
        CTRL --> SVC["Services\n(business logic)"]
        SVC --> PRISMA["PrismaService"]
        INT["Interceptors:\nLogging · Transform (envelope)"] -.-> CTRL
        FILT["Exception Filters:\nHttp · Prisma"] -.-> CTRL
    end

    PRISMA -->|SQL| DB[("PostgreSQL 16\nviews · functions\nprocedures · triggers")]
```

**Siklus request:** `Middleware → ThrottlerGuard → JwtAuthGuard → RolesGuard → ValidationPipe →
Controller → Service → PrismaService → PostgreSQL`, dengan **LoggingInterceptor** (latensi),
**TransformInterceptor** (envelope response), dan **Exception Filters** (normalisasi error) sebagai
lapisan lintas-fungsi.

---

## Use Case Diagram

```mermaid
flowchart LR
    Sales(["👤 Sales"])
    Finance(["👤 Finance"])
    PM(["👤 Project Manager"])
    Prod(["👤 Produksi"])
    Dir(["👤 Direktur"])

    subgraph SYS["Makromedia Integrated System"]
        UC1(["Login / Autentikasi"])
        UC2(["Kelola Proyek"])
        UC3(["Kelola Client & Company"])
        UC4(["Kelola Manpower"])
        UC5(["Buat Quotation"])
        UC6(["Buat & Update Invoice"])
        UC7(["Ajukan Production Cost"])
        UC8(["Approve / Reject Cost"])
        UC9(["Kelola User"])
        UC10(["Lihat Kalender & Progress"])
    end

    Sales --- UC1 & UC2 & UC3 & UC5 & UC10
    Finance --- UC1 & UC2 & UC3 & UC4 & UC5 & UC6 & UC7 & UC10
    PM --- UC1 & UC2 & UC4 & UC7 & UC10
    Prod --- UC1 & UC10
    Dir --- UC1 & UC2 & UC3 & UC4 & UC5 & UC6 & UC7 & UC8 & UC9 & UC10
```

---

## Sequence Diagram

### 1) Autentikasi (Login)

```mermaid
sequenceDiagram
    autonumber
    participant C as Client
    participant TG as ThrottlerGuard
    participant Ctrl as AuthController
    participant Svc as AuthService
    participant DB as PostgreSQL
    participant JWT as JwtService

    C->>TG: POST /api/auth/login {email, password}
    TG->>TG: cek limit (maks 5/menit/IP)
    alt melebihi limit
        TG-->>C: 429 Too Many Requests
    else
        TG->>Ctrl: teruskan
        Ctrl->>Svc: login(dto)
        Svc->>DB: findUnique(email)
        DB-->>Svc: user (+passwordHash)
        Svc->>Svc: bcrypt.compare(password, hash)
        alt kredensial salah / non-aktif
            Svc-->>C: 401 Unauthorized
        else valid
            Svc->>JWT: signAsync({sub, email, role})
            JWT-->>Svc: accessToken
            Svc-->>C: 200 {accessToken, user}
        end
    end
```

### 2) Approval Production Cost

```mermaid
sequenceDiagram
    autonumber
    participant PM as Project Manager
    participant Dir as Direktur
    participant API as ProductionCostsController
    participant Svc as ProductionCostsService
    participant DB as PostgreSQL

    PM->>API: POST /api/production-costs (status=PENDING)
    API->>Svc: create(dto)
    Svc->>DB: insert production_cost
    PM->>API: PATCH /api/production-costs/:id/submit
    API->>Svc: submit(id)
    Svc->>DB: set submittedAt
    Note over Dir: Direktur meninjau daftar pengajuan
    Dir->>API: GET /api/production-costs/applications?status=PENDING
    API-->>Dir: daftar pengajuan
    alt disetujui
        Dir->>API: PATCH /:id/approve
        Svc->>DB: status=APPROVED, approvedBy, approvedAt
    else ditolak
        Dir->>API: PATCH /:id/reject {rejectionNote}
        Svc->>DB: status=REJECTED, rejectionNote
    end
    API-->>Dir: 200 {data}
```

### 3) Quotation → Invoice

```mermaid
sequenceDiagram
    autonumber
    participant Sales
    participant Finance
    participant API as API
    participant DB as PostgreSQL

    Sales->>API: POST /api/quotations {items[], discount, tax}
    API->>DB: hitung subtotal & total → simpan quotation + items
    API-->>Sales: 201 {quotation}
    Note over Finance: Setelah quotation disetujui
    Finance->>API: POST /api/invoices {quotationId, items[]}
    API->>DB: buat invoice (relasi ke quotation)
    API-->>Finance: 201 {invoice}
    Finance->>API: PATCH /api/invoices/:id/status {status: PAID}
    API->>DB: update status pembayaran
```

---

## Alur Sistem

```mermaid
flowchart TD
    A[Client & Company terdaftar] --> B[Buat Proyek + assign PM]
    B --> C[Buat Quotation multi-item]
    C --> D{Quotation disetujui?}
    D -- Ya --> E[Terbitkan Invoice]
    E --> F[Update status Invoice: SENT → PAID / OVERDUE]
    B --> G[PM & Manpower kerjakan Task]
    G --> H[Update progress Task]
    B --> I[Catat Production Cost - PENDING]
    I --> J[PM submit ke Direktur]
    J --> K{Keputusan Direktur}
    K -- Approve --> L[Cost APPROVED - masuk total biaya]
    K -- Reject --> M[Cost REJECTED + catatan]
    F --> N[Catat Payment - Total Paid / Rest of Bill]
    H --> O[Kalender & ringkasan progress proyek]
```

---

## Model Data (ERD)

Entitas inti mengikuti *class diagram* SDD (13 class inti + 3 tabel operasional). Konvensi: kolom &
tabel database memakai `snake_case` via `@map`/`@@map`.

```mermaid
erDiagram
    User ||--o{ Project : "membuat / me-manage"
    User ||--o{ ProjectMember : "menjadi anggota"
    User ||--o{ Task : "ditugaskan"
    User ||--o{ ProductionCost : "membuat / menyetujui"
    CompanyClient ||--o{ Client : "punya PIC"
    Client ||--o{ Project : "memiliki"
    Project ||--o{ ProjectMember : ""
    Project ||--o{ ProjectLink : ""
    Project ||--o{ Task : ""
    Project ||--o{ ProjectProgress : ""
    Project ||--o{ Quotation : ""
    Project ||--o{ Invoice : ""
    Project ||--o{ ProductionCost : ""
    Project ||--o{ Payment : ""
    Quotation ||--o{ QuotationItem : ""
    Quotation ||--o{ Invoice : "diturunkan menjadi"
    Invoice ||--o{ InvoiceItem : ""
    Manpower {
        uuid id
        string name
        string position
        decimal standardRate
    }

    User {
        uuid id
        string name
        string email
        enum role
        boolean isActive
    }
    Project {
        uuid id
        string name
        enum category
        enum status
        decimal contractValue
    }
    Quotation {
        uuid id
        string quotationNumber
        decimal totalValue
        enum status
    }
    Invoice {
        uuid id
        string invoiceNumber
        decimal amount
        enum status
    }
    ProductionCost {
        uuid id
        string category
        decimal amount
        enum status
    }
    Payment {
        uuid id
        decimal amount
        datetime paidAt
    }
```

**Enumerasi domain:**

| Enum | Nilai |
| ---- | ----- |
| `RoleUser` | `SALES`, `PRODUKSI`, `PROJECT_MANAGER`, `FINANCE`, `DIREKTUR` |
| `StatusProyek` | `DRAFT`, `ACTIVE`, `ON_HOLD`, `COMPLETED`, `CANCELLED` |
| `StatusTask` | `TODO`, `IN_PROGRESS`, `DONE` |
| `StatusQuotation` | `DRAFT`, `SENT`, `APPROVED`, `REJECTED` |
| `StatusInvoice` | `DRAFT`, `SENT`, `PAID`, `OVERDUE` |
| `StatusBiaya` | `PENDING`, `APPROVED`, `REJECTED` |
| `KategoriProyek` | `EVENT`, `CORPORATE_VIDEO`, `FILM_PRODUCTION`, `WEDDING`, `OTHER` |

> Tabel operasional tambahan di luar 13 class inti: `project_members` (relasi M-N user-proyek),
> `project_links` (tautan deliverable), dan `payments` (riwayat pembayaran untuk *Total Paid* /
> *Rest of Bill*). `CalendarEvent` bersifat turunan (dibangun on-the-fly, tidak dipersistensi).

---

## RBAC (Matriks Hak Akses)

Guard global `JwtAuthGuard → RolesGuard` memproteksi seluruh endpoint kecuali yang ditandai
`@Public()`. Tanpa `@Roles`, endpoint dapat diakses **semua role terautentikasi**.

| Modul / Aksi | Sales | Finance | PM | Produksi | Direktur |
| ------------ | :---: | :-----: | :-: | :------: | :------: |
| Lihat proyek (scoped) | ✅ | ✅ | ✅¹ | ✅¹ | ✅ |
| Tambah proyek | ✅ | ✅ | - | - | ✅ |
| Edit proyek | ✅ | ✅ | ✅ | - | ✅ |
| Hapus proyek | - | ✅ | - | - | ✅ |
| Client & Company (tambah/edit) | ✅ | ✅ | - | - | ✅ |
| Client & Company (hapus) | - | ✅ | - | - | ✅ |
| Manpower (tambah/edit) | - | ✅ | ✅ | - | ✅ |
| Manpower (hapus) | - | ✅ | - | - | ✅ |
| Quotation (buat) | ✅ | ✅ | - | - | ✅ |
| Invoice (buat/status) | - | ✅ | - | - | ✅ |
| Production Cost (buat/edit) | - | ✅ | ✅ | - | ✅ |
| Production Cost - submit | - | - | ✅ | - | - |
| Production Cost - approve/reject | - | - | - | - | ✅ |
| User Management | - | - | - | - | ✅ |

<sub>¹ PM & Produksi hanya melihat proyek yang menjadi tanggung jawabnya (data di-*scope* di service).</sub>

---

## Referensi API / Endpoint

**Base URL:** `http://localhost:4000/api` · **Auth:** `Authorization: Bearer <accessToken>`
(kecuali endpoint ber-tag *Public*) · **Swagger UI:** `http://localhost:4000/api/docs` (non-production).

### Auth - `/auth`
| Method | Path | Akses | Body / Query | Deskripsi |
| ------ | ---- | ----- | ------------ | --------- |
| `POST` | `/auth/login` | Public · *rate limit 5/menit* | `{ email, password }` | Login, mengembalikan `accessToken` + `user`. |
| `GET` | `/auth/me` | Authenticated | - | Profil user dari token. |

### Health - `/health`
| Method | Path | Akses | Deskripsi |
| ------ | ---- | ----- | --------- |
| `GET` | `/health` | Public | Status app, latensi DB, memori. |

### Users - `/users` *(seluruh modul: Direktur)*
| Method | Path | Body | Deskripsi |
| ------ | ---- | ---- | --------- |
| `GET` | `/users` | - | Daftar user (tanpa `passwordHash`). |
| `POST` | `/users` | `{ name, email, password(min 8), role }` | Buat user baru. |

### Company Clients - `/company-clients`
| Method | Path | Akses | Body |
| ------ | ---- | ----- | ---- |
| `GET` | `/company-clients` | Authenticated | - |
| `POST` | `/company-clients` | Sales, Finance, Direktur | `{ name, email?, phone?, website?, address? }` |
| `PATCH` | `/company-clients/:id` | Sales, Finance, Direktur | *(sama)* |
| `DELETE` | `/company-clients/:id` | Finance, Direktur | - |

### Clients (PIC) - `/clients`
| Method | Path | Akses | Body |
| ------ | ---- | ----- | ---- |
| `GET` | `/clients` | Authenticated | - |
| `POST` | `/clients` | Sales, Finance, Direktur | `{ companyClientId, name, email?, phone?, address? }` |
| `PATCH` | `/clients/:id` | Sales, Finance, Direktur | *(sama)* |
| `DELETE` | `/clients/:id` | Finance, Direktur | - |

### Manpower - `/manpower`
| Method | Path | Akses | Body |
| ------ | ---- | ----- | ---- |
| `GET` | `/manpower` | Authenticated | - |
| `POST` | `/manpower` | PM, Finance, Direktur | `{ name, position?, email?, phone?, skill?, employmentStatus?, bankName?, bankAccountNo?, standardRate? }` |
| `PATCH` | `/manpower/:id` | PM, Finance, Direktur | *(sama)* |
| `DELETE` | `/manpower/:id` | Finance, Direktur | - |

### Projects - `/projects`
| Method | Path | Akses | Body / Query |
| ------ | ---- | ----- | ------------ |
| `GET` | `/projects` | Authenticated *(scoped)* | Query: `search?`, `category?`, `status?` |
| `GET` | `/projects/:id` | Authenticated *(scoped)* | - |
| `POST` | `/projects` | Sales, Finance, Direktur | `{ name, category, clientId, projectManagerId?, contractValue?, eventDate?, startDate?, endDate?, ... }` |
| `PATCH` | `/projects/:id` | Sales, Finance, Direktur, PM | *(partial)* |
| `DELETE` | `/projects/:id` | Finance, Direktur | - |

### Quotations - `/quotations`
| Method | Path | Akses | Body |
| ------ | ---- | ----- | ---- |
| `GET` | `/quotations/project/:projectId` | Authenticated | - |
| `GET` | `/quotations/:id` | Authenticated | - |
| `POST` | `/quotations` | Sales, Finance, Direktur | `{ projectId, quotationNumber, discountPercent?, taxAmount?, notes?, items: [{ item, unitPrice, quantity, frequency?, period? }] }` |

### Invoices - `/invoices`
| Method | Path | Akses | Body |
| ------ | ---- | ----- | ---- |
| `GET` | `/invoices/project/:projectId` | Authenticated | - |
| `POST` | `/invoices` | Finance, Direktur | `{ projectId, quotationId?, invoiceNumber, dueDate?, paymentInstruction?, items: [...] }` |
| `PATCH` | `/invoices/:id/status` | Finance, Direktur | `{ status: DRAFT\|SENT\|PAID\|OVERDUE }` |

### Production Costs - `/production-costs`
| Method | Path | Akses | Body / Query |
| ------ | ---- | ----- | ------------ |
| `GET` | `/production-costs/applications` | Direktur | Query: `status?` |
| `GET` | `/production-costs/project/:projectId` | Authenticated | - |
| `POST` | `/production-costs` | PM, Finance, Direktur | `{ projectId, category, unitPrice, quantity?, frequency?, executorName?, ... }` |
| `PATCH` | `/production-costs/:id` | PM, Finance, Direktur | *(partial)* |
| `PATCH` | `/production-costs/:id/submit` | PM | - |
| `PATCH` | `/production-costs/:id/approve` | Direktur | - |
| `PATCH` | `/production-costs/:id/reject` | Direktur | `{ rejectionNote }` |
| `DELETE` | `/production-costs/:id` | PM, Finance, Direktur | - |

### Calendar - `/calendar`
| Method | Path | Akses | Deskripsi |
| ------ | ---- | ----- | --------- |
| `GET` | `/calendar/events` | Authenticated | Event proyek (turunan, di-*scope* per user). |

---

## Format Response & Error

**Response sukses** dibungkus envelope seragam oleh `TransformInterceptor`:

```json
{
  "statusCode": 200,
  "message": "Success",
  "data": { }
}
```

**Response error** dinormalisasi oleh `HttpExceptionFilter` / `PrismaExceptionFilter`:

```json
{
  "statusCode": 409,
  "errorCode": "P2002",
  "message": "Data dengan nilai unik tersebut sudah terdaftar di database [email].",
  "timestamp": "2026-08-13T09:00:00.000Z",
  "path": "/api/users"
}
```

| Kode | Makna |
| ---- | ----- |
| `400` | Validasi gagal / Foreign Key violation (`P2003`). |
| `401` | Token tidak valid / kredensial salah. |
| `403` | Role tidak berwenang (RBAC). |
| `404` | Data tidak ditemukan (`P2025`). |
| `409` | Duplikasi nilai unik (`P2002`). |
| `429` | Melebihi rate limit. |
| `500` | Kesalahan internal (stack trace hanya di-log server-side). |

---

## Objek Database

Diterapkan via `pnpm db:objects` (`prisma/apply-sql-objects.ts`) setelah skema dibuat:

- **Views** - `vw_project_detail`, `vw_task_monitoring`, `vw_production_cost_summary`.
- **Functions** - `fn_total_production_cost(project_id)` (total biaya `APPROVED`),
  `fn_project_progress(project_id)` (rata-rata progress task).
- **Procedures** - `sp_add_project_member(project_id, user_id)`,
  `sp_create_invoice(project_id, quotation_id, created_by, invoice_number, amount, due_date)`.
- **Triggers** - auto `updated_at`, auto `sub_total` (item quotation/invoice), auto `amount`
  (production cost = `unit_price × quantity × frequency`).
- **Constraints** - `CHECK` progress task 0-100.

---

## Keamanan (Security Hardening)

- **Fail-fast env validation** (`validateEnv`) - aplikasi menolak start bila `DATABASE_URL`/
  `JWT_SECRET` kosong, terlalu pendek (< 16 karakter), atau masih placeholder (fatal di production).
- **JWT** - Bearer token, tanpa *secret* default yang tidak aman.
- **RBAC berlapis** - `JwtAuthGuard` → `RolesGuard` global.
- **Rate limiting** (`@nestjs/throttler`) - global **100 request/60 detik**, login **5/60 detik** per IP.
- **helmet** - security headers (CSP aktif di production).
- **CORS whitelist** - hanya origin dari `FRONTEND_URL` (tanpa fallback wildcard).
- **Password** - bcrypt cost factor **12**; `passwordHash` tak pernah dikembalikan ke klien.
- **ValidationPipe global** - `whitelist` + `forbidNonWhitelisted` + `transform`.
- **Swagger** dimatikan di production; **compression** & **graceful shutdown hooks** aktif.
- **Dependency** - 0 kerentanan (`pnpm audit`), override keamanan di `pnpm-workspace.yaml`.

---

## Struktur Folder

```
Backend_Makromedia-Integrated-System/
├── prisma/
│   ├── schema.prisma          # sumber kebenaran struktur database
│   ├── sql/                    # 01_views · 02_functions · 03_triggers_constraints
│   ├── seed.ts                 # data awal
│   └── apply-sql-objects.ts    # menerapkan objek SQL kustom
├── src/
│   ├── common/                 # decorators · guards · filters · interceptors
│   ├── config/                 # configuration · env.validation
│   ├── health/                 # health check
│   ├── prisma/                 # PrismaService (global)
│   ├── modules/                # auth · users · projects · clients · company-clients
│   │                           # manpower · quotations · invoices · production-costs · calendar
│   ├── app.module.ts
│   └── main.ts                 # bootstrap (helmet, cors, swagger, throttler)
├── docker-compose.yml          # PostgreSQL 16
├── nest-cli.json · tsconfig.json
├── package.json · pnpm-workspace.yaml
└── README.md
```

---

## Prasyarat & Instalasi

**Prasyarat:** Node.js ≥ 20 · pnpm ≥ 9 · Docker (untuk PostgreSQL) atau PostgreSQL 16 lokal.

```bash
# 1. Nyalakan database (PostgreSQL → localhost:5433)
docker compose up -d postgres

# 2. Siapkan environment & dependency
cp .env.example .env          # isi DATABASE_URL & JWT_SECRET (acak, ≥ 16 char)
pnpm install

# 3. Generate client, skema, objek SQL, dan seed
pnpm prisma:generate
pnpm db:migrate --name init   # atau: pnpm db:setup (push + objek SQL + seed)
pnpm db:objects
pnpm db:seed

# 4. Jalankan
pnpm start:dev
# API  → http://localhost:4000/api
# Docs → http://localhost:4000/api/docs
```

> Buat `JWT_SECRET` kuat:
> `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"`

---

## Environment Variables

| Variabel | Wajib | Default | Keterangan |
| -------- | :---: | ------- | ---------- |
| `DATABASE_URL` | ✅ | - | Koneksi PostgreSQL (Prisma). |
| `JWT_SECRET` | ✅ | - | Min. 16 karakter, bukan placeholder. |
| `JWT_EXPIRES_IN` | - | `1d` | Masa berlaku token. |
| `PORT` | - | `4000` | Port HTTP. |
| `NODE_ENV` | - | `development` | `production` mengaktifkan mode ketat. |
| `FRONTEND_URL` | - | `http://localhost:3000` | Whitelist CORS (comma-separated). |

---

## Script NPM

| Script | Fungsi |
| ------ | ------ |
| `pnpm start:dev` | Jalankan dengan watch mode. |
| `pnpm build` / `pnpm start:prod` | Build ke `dist/` / jalankan production. |
| `pnpm prisma:generate` | Generate Prisma Client. |
| `pnpm db:migrate` | Migrasi development. |
| `pnpm db:setup` | `db push` + objek SQL + seed (sekali jalan). |
| `pnpm db:seed` / `pnpm db:objects` | Seed data / terapkan objek SQL. |
| `pnpm lint` | ESLint + fix. |

---

## Alur Git (Git Flow)

```
feature/* · bugfix/* · chore/* · refactor/* · perf/* · docs/*
        │  (Pull Request)
        ▼
     develop  ──►  staging  ──►  main (release)
```

Branch dibuat dari `develop` dengan prefix sesuai jenis perubahan, di-*merge* via Pull Request.
Commit mengikuti **Conventional Commits** (`feat(scope): ...`, `fix: ...`, `chore(deps): ...`).

---

## Akun Demo

Semua akun memakai password **`Password123!`**.

| Role | Email |
| ---- | ----- |
| Direktur | `direktur@makromedia.id` |
| Finance | `finance@makromedia.id` |
| Sales | `sales@makromedia.id` |
| Project Manager | `pm@makromedia.id` |
| Produksi | `produksi@makromedia.id` |
