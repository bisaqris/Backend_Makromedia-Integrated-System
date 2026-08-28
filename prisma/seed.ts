/**
 * Prisma Seed — data awal Makromedia Integrated System.
 * Jalankan: pnpm db:seed   (atau  pnpm prisma db seed)
 */
import { PrismaClient, RoleUser } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('Password123!', 10);

  // ---- Users (1 per role) --------------------------------------------------
  const [direktur, finance, sales, pm, produksi] = await Promise.all(
    (
      [
        ['Direktur Utama', 'direktur@makromedia.id', RoleUser.DIREKTUR],
        ['Finance Officer', 'finance@makromedia.id', RoleUser.FINANCE],
        ['Sales Executive', 'sales@makromedia.id', RoleUser.SALES],
        ['Project Manager', 'pm@makromedia.id', RoleUser.PROJECT_MANAGER],
        ['Production Team', 'produksi@makromedia.id', RoleUser.PRODUKSI],
      ] as const
    ).map(([name, email, role]) =>
      prisma.user.upsert({
        where: { email },
        update: {},
        create: { name, email, passwordHash: password, role },
      }),
    ),
  );

  // ---- Cleanup existing data for idempotent seeding ------------------------
  await prisma.payment.deleteMany();
  await prisma.invoiceItem.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.quotationItem.deleteMany();
  await prisma.quotation.deleteMany();
  await prisma.productionCost.deleteMany();
  await prisma.task.deleteMany();
  await prisma.projectLink.deleteMany();
  await prisma.projectMember.deleteMany();
  await prisma.projectProgress.deleteMany();
  await prisma.project.deleteMany();
  await prisma.manpowerSkill.deleteMany();
  await prisma.skill.deleteMany();
  await prisma.manpower.deleteMany();
  await prisma.client.deleteMany();
  await prisma.companyClient.deleteMany();

  // ---- Client company + PIC ------------------------------------------------
  const company = await prisma.companyClient.create({
    data: {
      name: 'Telkomsel',
      email: 'partnership@telkomsel.co.id',
      phone: '021-5551234',
      address: 'Malang, Jawa Timur',
    },
  });

  const client = await prisma.client.create({
    data: {
      companyClientId: company.id,
      name: 'Mr. Bayu',
      email: 'bayu@82pro.co.id',
      phone: '0812-3456-7890',
    },
  });

  // ---- Skills (master data) ------------------------------------------------
  const [skVideo, skColor, skCinema, skAudio, skEditing] = await Promise.all(
    ['Videography', 'Color Grading', 'Cinematography', 'Audio Engineering', 'Editing'].map((name) =>
      prisma.skill.create({ data: { name } }),
    ),
  );

  // ---- Manpower (+ tautan skill many-to-many) ------------------------------
  await prisma.manpower.create({
    data: {
      name: 'Andy Setiawan', position: 'Senior Videographer', skill: 'Videography, Color Grading',
      employmentStatus: 'FULLTIME', standardRate: '300000',
      skills: { create: [{ skillId: skVideo.id }, { skillId: skColor.id }, { skillId: skEditing.id }] },
    },
  });
  await prisma.manpower.create({
    data: {
      name: 'Krismanegara', position: 'Cameraman', skill: 'Cinematography',
      employmentStatus: 'FREELANCE', standardRate: '100000',
      skills: { create: [{ skillId: skCinema.id }, { skillId: skAudio.id }] },
    },
  });

  // ---- Project -------------------------------------------------------------
  const project = await prisma.project.create({
    data: {
      name: 'Annual Summit Livestream',
      description: 'Livestream & dokumentasi event tahunan.',
      category: 'EVENT',
      clientId: client.id,
      createdById: sales.id,
      projectManagerId: pm.id,
      clientType: 'Event Organizer',
      partnershipModel: 'B2B',
      venue: 'Balai Kota Malang',
      contractValue: '20000000',
      eventDate: new Date('2026-05-21'),
      startDate: new Date('2026-05-01'),
      endDate: new Date('2026-05-30'),
      status: 'ACTIVE',
      members: { create: [{ userId: produksi.id }, { userId: pm.id }] },
      links: { create: [{ label: 'Deliverables', url: 'https://drive.google.com/' }] },
    },
  });

  // ---- Tasks ---------------------------------------------------------------
  await prisma.task.createMany({
    data: [
      { projectId: project.id, assignedToId: produksi.id, title: 'Livestreaming platform setup', progress: 100, status: 'DONE' },
      { projectId: project.id, assignedToId: produksi.id, title: 'Technical rundown draft', progress: 40, status: 'IN_PROGRESS' },
      { projectId: project.id, assignedToId: produksi.id, title: 'Dress rehearsal & test stream', progress: 0, status: 'TODO' },
    ],
  });

  // ---- Quotation + items ---------------------------------------------------
  const quotation = await prisma.quotation.create({
    data: {
      projectId: project.id,
      createdById: sales.id,
      quotationNumber: '001/QUO.MAKROMEDIA/11/2026',
      status: 'SENT',
      subtotal: '2000000',
      totalValue: '2000000',
      items: {
        create: [
          { item: 'Livecam', description: '2 Kamera, Editing, Switcher', unitPrice: '1000000', quantity: 1, frequency: 1, period: 'hari', subTotal: '1000000' },
          { item: 'Foto Dokumentasi', unitPrice: '1000000', quantity: 1, frequency: 1, period: 'hari', subTotal: '1000000' },
        ],
      },
    },
  });

  // ---- Invoice + item ------------------------------------------------------
  await prisma.invoice.create({
    data: {
      projectId: project.id,
      quotationId: quotation.id,
      createdById: finance.id,
      invoiceNumber: '001/INV.MAKROMEDIA/11/2026',
      amount: '2000000',
      status: 'SENT',
      dueDate: new Date('2026-11-09'),
      items: {
        create: [{ item: 'Full Production Package', description: 'Event Telkomsel Malang', unitPrice: '2000000', quantity: 1, frequency: 1, period: '1', subTotal: '2000000' }],
      },
    },
  });

  // ---- Production cost (menunggu approval) ---------------------------------
  await prisma.productionCost.create({
    data: {
      projectId: project.id,
      createdById: pm.id,
      category: 'Fee SDM Internal',
      description: 'Project Manager',
      executorName: 'Agus Tjahjono',
      unitPrice: '100000',
      quantity: 1,
      frequency: 3,
      amount: '300000',
      status: 'PENDING',
      submittedAt: new Date(),
    },
  });

  // ---- Payment ------------------------------------------------------------
  await prisma.payment.create({
    data: {
      projectId: project.id,
      amount: '1000000',
      paymentMethod: 'Transfer',
      bankTo: 'BCA Bisnis',
      bankAccount: '7265189474',
      note: 'Payment DP',
      paidAt: new Date('2026-12-10'),
    },
  });

  // Invoice DRAFT & cost REJECTED pada proyek pertama (variasi status).
  await prisma.invoice.create({
    data: {
      projectId: project.id, createdById: finance.id,
      invoiceNumber: '006/INV.MAKROMEDIA/11/2026', amount: '1000000', status: 'DRAFT',
      items: { create: [{ item: 'Termin 2 (draft)', unitPrice: '1000000', quantity: 1, frequency: 1, subTotal: '1000000' }] },
    },
  });
  await prisma.productionCost.create({
    data: {
      projectId: project.id, createdById: pm.id, category: 'Konsumsi',
      description: 'Katering kru (ditolak)', unitPrice: '500000', quantity: 1, frequency: 1,
      amount: '500000', status: 'REJECTED', submittedAt: new Date(),
      approvedById: direktur.id, approvedAt: new Date(), rejectionNote: 'Melebihi anggaran konsumsi.',
    },
  });

  // ---- Proyek COMPLETED: quotation APPROVED, invoice PAID, cost APPROVED, lunas ----
  const projectDone = await prisma.project.create({
    data: {
      name: 'Corporate Profile Video 2025', description: 'Company profile & product teaser.',
      category: 'CORPORATE_VIDEO', clientId: client.id, createdById: sales.id, projectManagerId: pm.id,
      contractValue: '15000000', status: 'COMPLETED',
      startDate: new Date('2025-09-01'), endDate: new Date('2025-10-15'),
      members: { create: [{ userId: produksi.id }] },
    },
  });
  await prisma.quotation.create({
    data: {
      projectId: projectDone.id, createdById: sales.id,
      quotationNumber: '002/QUO.MAKROMEDIA/09/2025', status: 'APPROVED',
      subtotal: '15000000', totalValue: '15000000',
      items: { create: [{ item: 'Corporate Video Package', unitPrice: '15000000', quantity: 1, frequency: 1, subTotal: '15000000' }] },
    },
  });
  await prisma.invoice.create({
    data: {
      projectId: projectDone.id, createdById: finance.id,
      invoiceNumber: '002/INV.MAKROMEDIA/10/2025', amount: '15000000', status: 'PAID',
      dueDate: new Date('2025-10-30'),
      items: { create: [{ item: 'Corporate Video Package', unitPrice: '15000000', quantity: 1, frequency: 1, subTotal: '15000000' }] },
    },
  });
  await prisma.productionCost.create({
    data: {
      projectId: projectDone.id, createdById: pm.id, category: 'Sewa Alat',
      description: 'Cinema camera & lighting', unitPrice: '2000000', quantity: 1, frequency: 2,
      amount: '4000000', status: 'APPROVED', submittedAt: new Date('2025-09-10'),
      approvedById: direktur.id, approvedAt: new Date('2025-09-11'),
    },
  });
  await prisma.payment.create({
    data: { projectId: projectDone.id, amount: '15000000', paymentMethod: 'Transfer', bankTo: 'BCA Bisnis', note: 'Pelunasan' },
  });
  await prisma.task.create({
    data: { projectId: projectDone.id, assignedToId: produksi.id, title: 'Final delivery', progress: 100, status: 'DONE' },
  });

  // ---- Proyek DRAFT: quotation DRAFT, belum ada invoice ----
  const projectDraft = await prisma.project.create({
    data: {
      name: 'Wedding Cinematic Package', category: 'WEDDING', clientId: client.id,
      createdById: sales.id, contractValue: '8000000', status: 'DRAFT',
    },
  });
  await prisma.quotation.create({
    data: {
      projectId: projectDraft.id, createdById: sales.id,
      quotationNumber: '003/QUO.MAKROMEDIA/12/2026', status: 'DRAFT',
      subtotal: '8000000', totalValue: '8000000',
      items: { create: [{ item: 'Wedding Cinematic', unitPrice: '8000000', quantity: 1, frequency: 1, subTotal: '8000000' }] },
    },
  });

  // ---- Proyek ON_HOLD: quotation REJECTED, invoice OVERDUE ----
  const projectHold = await prisma.project.create({
    data: {
      name: 'Short Film Production', category: 'FILM_PRODUCTION', clientId: client.id,
      createdById: sales.id, projectManagerId: pm.id, contractValue: '25000000', status: 'ON_HOLD',
    },
  });
  await prisma.quotation.create({
    data: {
      projectId: projectHold.id, createdById: sales.id,
      quotationNumber: '005/QUO.MAKROMEDIA/08/2026', status: 'REJECTED',
      subtotal: '25000000', totalValue: '25000000',
      items: { create: [{ item: 'Film Production Full', unitPrice: '25000000', quantity: 1, frequency: 1, subTotal: '25000000' }] },
    },
  });
  await prisma.invoice.create({
    data: {
      projectId: projectHold.id, createdById: finance.id,
      invoiceNumber: '004/INV.MAKROMEDIA/08/2026', amount: '10000000', status: 'OVERDUE',
      dueDate: new Date('2026-08-01'),
      items: { create: [{ item: 'DP Produksi', unitPrice: '10000000', quantity: 1, frequency: 1, subTotal: '10000000' }] },
    },
  });

  console.log('✅ Seed selesai. Login demo - password semua akun: Password123!');
  console.log('   direktur@makromedia.id | finance@makromedia.id | sales@makromedia.id | pm@makromedia.id | produksi@makromedia.id');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
