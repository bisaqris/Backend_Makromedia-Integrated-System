import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma, StatusInvoice } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthUser } from '../../common/decorators/current-user.decorator';
import {
  CompanyConfig, buildBillTo, buildIssuer, buildProjectInfo, mapDocumentItems,
} from '../../common/documents/document-preview';
import { CreateInvoiceDto } from './dto/invoice.dto';

@Injectable()
export class InvoicesService {
  constructor(private prisma: PrismaService, private config: ConfigService) {}

  findByProject(projectId: string) {
    return this.prisma.invoice.findMany({
      where: { projectId }, include: { items: true }, orderBy: { createdAt: 'desc' },
    });
  }

  /** Detail satu invoice + items (untuk halaman detail/preview). */
  async findOne(id: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: { items: true, quotation: { select: { id: true, quotationNumber: true } } },
    });
    if (!invoice) throw new NotFoundException('Invoice tidak ditemukan.');
    return invoice;
  }

  /** Data JSON lengkap untuk preview dokumen invoice (dirender di FE). */
  async getPreview(id: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: {
        items: true,
        quotation: { select: { id: true, quotationNumber: true } },
        createdBy: { select: { id: true, name: true, role: true } },
        project: {
          select: {
            id: true, name: true, category: true, venue: true, eventDate: true,
            client: {
              select: {
                name: true, email: true, phone: true, address: true,
                company: { select: { name: true, email: true, phone: true, website: true, address: true } },
              },
            },
          },
        },
      },
    });
    if (!invoice) throw new NotFoundException('Invoice tidak ditemukan.');

    const company = this.config.get<CompanyConfig>('company')!;

    return {
      documentType: 'INVOICE' as const,
      number: invoice.invoiceNumber,
      status: invoice.status,
      date: invoice.createdAt,
      dueDate: invoice.dueDate,
      notes: invoice.notes,
      paymentInstruction: invoice.paymentInstruction,
      quotationNumber: invoice.quotation?.quotationNumber ?? null,
      issuer: buildIssuer(company),
      billTo: buildBillTo(invoice.project.client),
      project: buildProjectInfo(invoice.project),
      preparedBy: invoice.createdBy,
      items: mapDocumentItems(invoice.items),
      summary: {
        amount: invoice.amount,
      },
    };
  }

  create(dto: CreateInvoiceDto, user: AuthUser) {
    const items = dto.items.map((i) => ({
      ...i, frequency: i.frequency ?? 1,
      subTotal: new Prisma.Decimal(i.unitPrice).mul(i.quantity).mul(i.frequency ?? 1),
    }));
    const amount = items.reduce((sum, i) => sum.add(i.subTotal), new Prisma.Decimal(0));
    return this.prisma.invoice.create({
      data: {
        projectId: dto.projectId, quotationId: dto.quotationId, createdById: user.id,
        invoiceNumber: dto.invoiceNumber,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        paymentInstruction: dto.paymentInstruction, notes: dto.notes,
        amount, items: { create: items },
      },
      include: { items: true },
    });
  }

  async updateStatus(id: string, status: StatusInvoice) {
    const inv = await this.prisma.invoice.findUnique({ where: { id } });
    if (!inv) throw new NotFoundException('Invoice tidak ditemukan.');
    return this.prisma.invoice.update({ where: { id }, data: { status } });
  }
}
