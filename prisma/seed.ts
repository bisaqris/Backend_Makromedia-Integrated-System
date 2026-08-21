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

  // ---- Manpower --------------------------------------------------------
  await prisma.manpower.createMany({
    data: [
      { name: 'Andy Setiawan', position: 'Senior Videographer', skill: 'Videography, Color Grading', employmentStatus: 'FULLTIME', standardRate: '300000' },
      { name: 'Krismanegara', position: 'Cameraman', skill: 'Cinematography', employmentStatus: 'FREELANCE', standardRate: '100000' },
    ],
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

  console.log('✅ Seed selesai. Login demo — password semua akun: Password123!');
  console.log('   direktur@makromedia.id | finance@makromedia.id | sales@makromedia.id | pm@makromedia.id | produksi@makromedia.id');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
