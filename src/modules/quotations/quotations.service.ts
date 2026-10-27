import {
  BadRequestException, ForbiddenException, Injectable, NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma, StatusQuotation } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthUser } from '../../common/decorators/current-user.decorator';
import {
  CompanyConfig, buildBillTo, buildIssuer, buildProjectInfo, mapDocumentItems,
} from '../../common/documents/document-preview';
import { CreateQuotationDto } from './dto/quotation.dto';

@Injectable()
export class QuotationsService {
  constructor(private prisma: PrismaService, private config: ConfigService) {}

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

  /** Data JSON lengkap untuk preview dokumen quotation (dirender di FE). */
  async getPreview(id: string) {
    const q = await this.prisma.quotation.findUnique({
      where: { id },
      include: {
        items: true,
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
    if (!q) throw new NotFoundException('Quotation tidak ditemukan.');

    const company = this.config.get<CompanyConfig>('company')!;
    const discountAmount = new Prisma.Decimal(q.subtotal)
      .mul(new Prisma.Decimal(q.discountPercent).div(100));

    return {
      documentType: 'QUOTATION' as const,
      number: q.quotationNumber,
      status: q.status,
      date: q.createdAt,
      notes: q.notes,
      issuer: buildIssuer(company),
      billTo: buildBillTo(q.project.client),
      project: buildProjectInfo(q.project),
      preparedBy: q.createdBy,
      items: mapDocumentItems(q.items),
      summary: {
        subtotal: q.subtotal,
        discountPercent: q.discountPercent,
        discountAmount,
        taxAmount: q.taxAmount,
        totalValue: q.totalValue,
      },
    };
  }

  create(dto: CreateQuotationDto, user: AuthUser) {
    const items = dto.items.map((i) => ({
      ...i, frequency: i.frequency ?? 1,
      subTotal: new Prisma.Decimal(i.unitPrice).mul(i.quantity).mul(i.frequency ?? 1),
    }));
    const subtotal = items.reduce((sum, i) => sum.add(i.subTotal), new Prisma.Decimal(0));
    const discount = subtotal.mul(new Prisma.Decimal(dto.discountPercent ?? 0).div(100));
    const total = subtotal.sub(discount).add(dto.taxAmount ?? 0);

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

  /**
   * Approval workflow: DRAFT -> SENT (Sales/Finance) -> APPROVED/REJECTED (Direktur).
   * Menegakkan transisi valid + otorisasi role pada tiap langkah.
   */
  async updateStatus(id: string, status: StatusQuotation, user: AuthUser) {
    const quotation = await this.findOne(id);

    if (status === StatusQuotation.SENT) {
      if (quotation.status !== StatusQuotation.DRAFT) {
        throw new BadRequestException('Hanya quotation berstatus DRAFT yang dapat dikirim (SENT).');
      }
      if (!['SALES', 'FINANCE', 'DIREKTUR'].includes(user.role)) {
        throw new ForbiddenException('Hanya Sales, Finance, atau Direktur yang dapat mengirim quotation.');
      }
    } else if (status === StatusQuotation.APPROVED || status === StatusQuotation.REJECTED) {
      if (quotation.status !== StatusQuotation.SENT) {
        throw new BadRequestException('Hanya quotation berstatus SENT yang dapat di-approve/reject.');
      }
      if (user.role !== 'DIREKTUR') {
        throw new ForbiddenException('Hanya Direktur yang dapat menyetujui/menolak quotation.');
      }
    } else {
      throw new BadRequestException('Transisi status tidak valid.');
    }

    return this.prisma.quotation.update({
      where: { id },
      data: { status },
      include: { items: true },
    });
  }
}
