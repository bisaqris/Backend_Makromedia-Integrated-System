/**
 * Helper pembentuk payload "preview dokumen" (quotation & invoice).
 * Backend hanya menyusun data JSON terstruktur dan lengkap; rendering
 * dokumen (tampilan/print/PDF) dilakukan di Frontend.
 */

export interface CompanyConfig {
  name: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  bankName: string;
  bankAccountNo: string;
  bankAccountName: string;
}

export interface DocumentIssuer {
  name: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  bank: { name: string; accountNo: string; accountName: string };
}

/** Blok "dari" (penerbit dokumen) dari konfigurasi perusahaan. */
export function buildIssuer(company: CompanyConfig): DocumentIssuer {
  return {
    name: company.name,
    address: company.address,
    phone: company.phone,
    email: company.email,
    website: company.website,
    bank: {
      name: company.bankName,
      accountNo: company.bankAccountNo,
      accountName: company.bankAccountName,
    },
  };
}

type ClientWithCompany = {
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  company: {
    name: string;
    email: string | null;
    phone: string | null;
    website: string | null;
    address: string | null;
  };
};

/** Blok "kepada" (penerima): perusahaan client + PIC. */
export function buildBillTo(client: ClientWithCompany) {
  return {
    company: {
      name: client.company.name,
      email: client.company.email,
      phone: client.company.phone,
      website: client.company.website,
      address: client.company.address,
    },
    pic: {
      name: client.name,
      email: client.email,
      phone: client.phone,
      address: client.address,
    },
  };
}

type ProjectInfo = {
  id: string;
  name: string;
  category: string;
  venue: string | null;
  eventDate: Date | null;
};

/** Ringkas info proyek untuk header dokumen. */
export function buildProjectInfo(project: ProjectInfo) {
  return {
    id: project.id,
    name: project.name,
    category: project.category,
    venue: project.venue,
    eventDate: project.eventDate,
  };
}

type DocumentItem = {
  item: string;
  description: string | null;
  unitPrice: unknown;
  quantity: number;
  frequency: number;
  period: string | null;
  subTotal: unknown;
};

/** Normalisasi baris item dokumen (urutan field konsisten untuk FE). */
export function mapDocumentItems(items: DocumentItem[]) {
  return items.map((i) => ({
    item: i.item,
    description: i.description,
    unitPrice: i.unitPrice,
    quantity: i.quantity,
    frequency: i.frequency,
    period: i.period,
    subTotal: i.subTotal,
  }));
}
