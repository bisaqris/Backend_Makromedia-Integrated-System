import { Injectable, NotFoundException } from '@nestjs/common';
import { StatusInvoice } from '@prisma/client';
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

  create(dto: CreateInvoiceDto, user: AuthUser) {
    const items = dto.items.map((i) => ({
      ...i, frequency: i.frequency ?? 1,
      subTotal: i.unitPrice * i.quantity * (i.frequency ?? 1),
    }));
    const amount = items.reduce((s, i) => s + i.subTotal, 0);
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
