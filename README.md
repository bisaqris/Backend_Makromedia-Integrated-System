# Makromedia Integrated System — Backend

Backend REST API untuk sistem manajemen proyek terintegrasi **CV. Makromedia Visual** (agensi kreatif: event, corporate video, film production, wedding). Dibangun sesuai *Software Design Document* dengan NestJS, autentikasi JWT, dan Role-Based Access Control (RBAC).

> Frontend (Next.js) berada di repositori terpisah.

## Arsitektur & Tech Stack

| Lapisan   | Teknologi                                       |
| --------- | ----------------------------------------------- |
| Backend   | NestJS 10 · TypeScript · Prisma ORM · Swagger   |
| Database  | PostgreSQL 16                                    |
| Auth      | JWT (Bearer) · Passport · RBAC 5 role           |

```
Backend_Makromedia-Integrated-System/
├── prisma/
│   ├── schema.prisma         # ← sumber kebenaran struktur database
│   ├── sql/                  # view, function, procedure, trigger, constraint
│   ├── seed.ts               # data awal
│   └── apply-sql-objects.ts  # menerapkan objek SQL kustom
├── src/
│   ├── common/               # RBAC guard, decorator, filter, interceptor
│   ├── config/               # konfigurasi app
│   ├── health/               # health check
│   ├── prisma/               # PrismaService (global)
│   ├── modules/              # auth, users, projects, clients, company-clients,
│   │                         # crew, quotations, invoices, production-costs, calendar
│   ├── app.module.ts
│   └── main.ts
├── docker-compose.yml        # PostgreSQL
├── nest-cli.json
├── tsconfig.json
├── package.json
└── README.md
```

## Prasyarat

- Node.js ≥ 18 · pnpm ≥ 8
- Docker (untuk PostgreSQL) atau instalasi PostgreSQL lokal
- `psql` di PATH (opsional — objek SQL diterapkan via script `ts-node`)

## Setup — mulai dari Database

Urutan sesuai pendekatan **database-first**.

### 1. Nyalakan PostgreSQL

```bash
docker compose up -d postgres
# PostgreSQL → localhost:5433 (dipetakan dari container 5432)
```

### 2. Siapkan environment

```bash
cp .env.example .env        # sesuaikan DATABASE_URL & JWT_SECRET bila perlu
pnpm install
```

### 3. Bangun skema, objek SQL, dan seed

```bash
# a. Generate Prisma Client
pnpm prisma:generate

# b. Buat tabel dari schema.prisma (migrasi awal)
pnpm db:migrate --name init

# c. Terapkan view / function / procedure / trigger / constraint
pnpm db:objects            # menjalankan prisma/apply-sql-objects.ts

# d. Isi data awal (5 user per role + contoh proyek)
pnpm db:seed
```

> Ketiga langkah b–d bisa disingkat dengan `pnpm db:setup` (memakai `prisma db push`).

### 4. Jalankan backend

```bash
pnpm start:dev
# API  → http://localhost:4000/api
# Docs → http://localhost:4000/api/docs   (Swagger)
```

## Akun Demo

Semua akun memakai password **`Password123!`**

| Role            | Email                      |
| --------------- | -------------------------- |
| Direktur        | direktur@makromedia.id     |
| Finance         | finance@makromedia.id      |
| Sales           | sales@makromedia.id        |
| Project Manager | pm@makromedia.id           |
| Produksi        | produksi@makromedia.id     |

## Model Data (ringkas)

Entitas inti mengikuti class diagram SDD: **User, CompanyClient, Client (PIC), Crew, Project, ProjectMember, Task, ProjectProgress, Quotation (+ items), Invoice (+ items), ProductionCost, Payment**.

Objek database yang disertakan:
- **Views** — `vw_project_detail`, `vw_task_monitoring`, `vw_production_cost_summary`
- **Functions** — `fn_total_production_cost`, `fn_project_progress`
- **Procedures** — `sp_add_project_member`, `sp_create_invoice`
- **Triggers** — auto `updated_at`, auto `sub_total` (quotation/invoice item), auto `amount` (production cost)
- **Constraints** — `CHECK` progress 0–100

## RBAC (ringkas)

Guard global (`JwtAuthGuard` → `RolesGuard`) memproteksi seluruh endpoint kecuali yang ditandai `@Public()` (login). Contoh pembatasan:
- **Add Project** → Sales, Finance, Direktur
- **Approval Cost** (approve/reject) → Direktur
- **User Management** → Direktur
- Data finansial (production cost) disembunyikan dari role **Produksi**; PM & Produksi hanya melihat proyek yang menjadi tanggung jawabnya.

## Catatan penambahan dari SDD

Untuk membuat sistem berjalan end-to-end, ditambahkan tiga tabel operasional di luar 13 class inti: `project_members` (relasi many-to-many user–proyek), `project_links` (tautan deliverable), dan `payments` (riwayat pembayaran client untuk perhitungan *rest of bill*). `CalendarEvent` bersifat turunan (tidak dipersistensi) dan dibangun on-the-fly oleh modul calendar.
