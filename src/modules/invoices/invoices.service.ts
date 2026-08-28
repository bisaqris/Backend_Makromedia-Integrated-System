import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, StatusInvoice } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthUser } from '../../common/decorators/current-user.decorator';
import { CreateInvoiceDto } from './dto/invoice.dto';

@Injectable()
export class InvoicesService {
  constructor(private prisma: PrismaService) {}

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
