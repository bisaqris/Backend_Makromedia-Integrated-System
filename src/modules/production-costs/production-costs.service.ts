import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { StatusBiaya } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthUser } from '../../common/decorators/current-user.decorator';
import { ProjectAccessService } from '../../common/services/project-access.service';
import {
  CreateProductionCostDto, UpdateProductionCostDto, RejectCostDto,
} from './dto/production-cost.dto';

@Injectable()
export class ProductionCostsService {
  constructor(
    private prisma: PrismaService,
    private access: ProjectAccessService,
  ) {}

  async findByProject(projectId: string, user: AuthUser) {
    await this.access.assertCanAccess(projectId, user);
    return this.prisma.productionCost.findMany({
      where: { projectId },
      include: { approvedBy: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  /** Daftar pengajuan (UC09 - Approval Cost). Direktur melihat status PENDING. */
  findApplications(status?: StatusBiaya) {
    return this.prisma.productionCost.findMany({
      where: { ...(status && { status }) },
      include: {
        project: { select: { id: true, name: true } },
        createdBy: { select: { id: true, name: true } },
      },
      orderBy: { submittedAt: 'desc' },
    });
  }

  async create(dto: CreateProductionCostDto, user: AuthUser) {
    await this.access.assertCanAccess(dto.projectId, user);
    // amount dihitung otomatis oleh trigger DB; diset juga di sini untuk konsistensi.
    const amount = dto.unitPrice * (dto.quantity ?? 1) * (dto.frequency ?? 1);
    return this.prisma.productionCost.create({
      data: { ...dto, amount, createdById: user.id },
    });
  }

  async update(id: string, dto: UpdateProductionCostDto, user: AuthUser) {
    const cost = await this.get(id);
    if (cost.status === StatusBiaya.APPROVED) {
      throw new BadRequestException('Biaya yang sudah disetujui tidak dapat diubah.');
    }
    await this.access.assertCanAccess(cost.projectId, user);
    return this.prisma.productionCost.update({ where: { id }, data: dto });
  }

  /** PM mengajukan biaya ke Direktur -> status PENDING (UC08). */
  async submit(id: string, user: AuthUser) {
    const cost = await this.get(id);
    await this.access.assertCanAccess(cost.projectId, user);
    return this.prisma.productionCost.update({
      where: { id },
      data: { status: StatusBiaya.PENDING, submittedAt: new Date() },
    });
  }

  /** Direktur menyetujui (UC09). */
  async approve(id: string, director: AuthUser) {
    await this.get(id);
    return this.prisma.productionCost.update({
      where: { id },
      data: { status: StatusBiaya.APPROVED, approvedById: director.id, approvedAt: new Date(), rejectionNote: null },
    });
  }

  /** Direktur menolak dengan catatan (UC09). */
  async reject(id: string, dto: RejectCostDto, director: AuthUser) {
    await this.get(id);
    return this.prisma.productionCost.update({
      where: { id },
      data: { status: StatusBiaya.REJECTED, approvedById: director.id, approvedAt: new Date(), rejectionNote: dto.rejectionNote },
    });
  }

  async remove(id: string, user: AuthUser) {
    const cost = await this.get(id);
    await this.access.assertCanAccess(cost.projectId, user);
    return this.prisma.productionCost.delete({ where: { id } });
  }

  private async get(id: string) {
    const cost = await this.prisma.productionCost.findUnique({ where: { id } });
    if (!cost) throw new NotFoundException('Data biaya produksi tidak ditemukan.');
    return cost;
  }
}
