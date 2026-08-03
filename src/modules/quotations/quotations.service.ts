import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthUser } from '../../common/decorators/current-user.decorator';
import { CreateQuotationDto } from './dto/quotation.dto';

@Injectable()
export class QuotationsService {
  constructor(private prisma: PrismaService) {}

  findByProject(projectId: string) {
    return this.prisma.quotation.findMany({
      where: { projectId }, include: { items: true }, orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const q = await this.prisma.quotation.findUnique({ where: { id }, include: { items: true } });
    if (!q) throw new NotFoundException('Quotation tidak ditemukan.');
    return q;
  }

  create(dto: CreateQuotationDto, user: AuthUser) {
    const items = dto.items.map((i) => ({
      ...i, frequency: i.frequency ?? 1,
      subTotal: i.unitPrice * i.quantity * (i.frequency ?? 1),
    }));
    const subtotal = items.reduce((s, i) => s + i.subTotal, 0);
    const discount = subtotal * ((dto.discountPercent ?? 0) / 100);
    const total = subtotal - discount + (dto.taxAmount ?? 0);

    return this.prisma.quotation.create({
      data: {
        projectId: dto.projectId,
        createdById: user.id,
        quotationNumber: dto.quotationNumber,
        discountPercent: dto.discountPercent ?? 0,
        taxAmount: dto.taxAmount ?? 0,
        subtotal, totalValue: total, notes: dto.notes,
        items: { create: items },
      },
      include: { items: true },
    });
  }
}
