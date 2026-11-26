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
import { getSkipTake, createPaginatedResponse } from '../../common/pagination/pagination.helper';
import { assertProjectEditable } from '../../common/services/project-status.util';
import { CreateQuotationDto, UpdateQuotationDto } from './dto/quotation.dto';
import { QueryQuotationDto } from './dto/query-quotation.dto';

@Injectable()
export class QuotationsService {
  constructor(private prisma: PrismaService, private config: ConfigService) {}

  /** Daftar seluruh quotation (lintas proyek) dengan filter & pagination. */
  async findAll(query: QueryQuotationDto) {
    const where: Prisma.QuotationWhereInput = {
      ...(query.status && { status: query.status }),
      ...(query.projectId && { projectId: query.projectId }),
      ...(query.search && {
        OR: [
          { quotationNumber: { contains: query.search, mode: 'insensitive' } },
          { project: { name: { contains: query.search, mode: 'insensitive' } } },
        ],
      }),
    };

    const total = await this.prisma.quotation.count({ where });
    const { skip, take } = getSkipTake(query);

    const allowedSortFields = ['createdAt', 'quotationNumber', 'totalValue', 'status'];
    const sortField = allowedSortFields.includes(query.sort ?? '') ? query.sort! : 'createdAt';
    const order = query.order ?? 'desc';

    const data = await this.prisma.quotation.findMany({
      where,
      include: { items: true, project: { select: { id: true, name: true } } },
      orderBy: { [sortField]: order },
      skip,
      take,
    });

    return createPaginatedResponse(data, total, query);
  }

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

  async create(dto: CreateQuotationDto, user: AuthUser) {
    await assertProjectEditable(this.prisma, dto.projectId);
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
   * Perbarui quotation beserta item-nya. Hanya diperbolehkan selama masih DRAFT
   * (belum dikirim/disetujui). Jika `items` dikirim, seluruh item diganti dan
   * subtotal/diskon/total dihitung ulang.
   */
  async update(id: string, dto: UpdateQuotationDto, _user: AuthUser) {
    const quotation = await this.findOne(id);
    await assertProjectEditable(this.prisma, quotation.projectId);
    if (quotation.status !== StatusQuotation.DRAFT) {
      throw new BadRequestException('Hanya quotation berstatus DRAFT yang dapat diperbarui.');
    }

    const discountPercent = dto.discountPercent ?? Number(quotation.discountPercent);
    const taxAmount = dto.taxAmount ?? Number(quotation.taxAmount);

    const newItems = dto.items?.map((i) => ({
      item: i.item,
      description: i.description,
      unitPrice: new Prisma.Decimal(i.unitPrice),
      quantity: i.quantity,
      frequency: i.frequency ?? 1,
      period: i.period,
      subTotal: new Prisma.Decimal(i.unitPrice).mul(i.quantity).mul(i.frequency ?? 1),
    }));

    const subtotal = newItems
      ? newItems.reduce((sum, i) => sum.add(i.subTotal), new Prisma.Decimal(0))
      : new Prisma.Decimal(quotation.subtotal);
    const discount = subtotal.mul(new Prisma.Decimal(discountPercent).div(100));
    const total = subtotal.sub(discount).add(taxAmount);

    return this.prisma.$transaction(async (tx) => {
      if (newItems) {
        await tx.quotationItem.deleteMany({ where: { quotationId: id } });
        await tx.quotationItem.createMany({
          data: newItems.map((i) => ({ ...i, quotationId: id })),
        });
      }
      return tx.quotation.update({
        where: { id },
        data: {
          ...(dto.quotationNumber !== undefined && { quotationNumber: dto.quotationNumber }),
          ...(dto.notes !== undefined && { notes: dto.notes }),
          discountPercent,
          taxAmount,
          subtotal,
          totalValue: total,
        },
        include: { items: true },
      });
    });
  }

  /**
   * BREAKING (v2): alur approval langsung. Quotation DRAFT di-APPROVE atau
   * REJECT oleh Direktur tanpa langkah SENT. Nilai SENT tidak lagi bisa diset.
   */
  async updateStatus(id: string, status: StatusQuotation, user: AuthUser, note?: string) {
    const quotation = await this.findOne(id);
    await assertProjectEditable(this.prisma, quotation.projectId);

    if (status !== StatusQuotation.APPROVED && status !== StatusQuotation.REJECTED) {
      throw new BadRequestException(
        'Alur quotation memakai approval langsung: status hanya dapat APPROVED atau REJECTED.',
      );
    }
    // Sumber: DRAFT (atau SENT data lama) yang belum diputuskan.
    if (quotation.status !== StatusQuotation.DRAFT && quotation.status !== StatusQuotation.SENT) {
      throw new BadRequestException('Hanya quotation yang belum diputuskan yang dapat di-approve/reject.');
    }
    if (user.role !== 'DIREKTUR') {
      throw new ForbiddenException('Hanya Direktur yang dapat menyetujui/menolak quotation.');
    }

    return this.prisma.quotation.update({
      where: { id },
      data: { status, ...(note !== undefined && { statusNote: note }) },
      include: { items: true },
    });
  }
}
