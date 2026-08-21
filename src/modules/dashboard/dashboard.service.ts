import { Injectable } from '@nestjs/common';
import { Prisma, RoleUser, StatusBiaya } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthUser } from '../../common/decorators/current-user.decorator';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  /** Ringkasan finansial global (untuk Direktur/Finance/Sales). */
  async summary() {
    const [projectAgg, paidAgg, costAgg] = await Promise.all([
      this.prisma.project.aggregate({ _sum: { contractValue: true } }),
      this.prisma.payment.aggregate({ _sum: { amount: true } }),
      this.prisma.productionCost.aggregate({
        where: { status: StatusBiaya.APPROVED },
        _sum: { amount: true },
      }),
    ]);
    const totalContractValue = Number(projectAgg._sum.contractValue ?? 0);
    const totalPaid = Number(paidAgg._sum.amount ?? 0);
    const approvedProductionCost = Number(costAgg._sum.amount ?? 0);
    return {
      totalContractValue,
      totalPaid,
      restOfBill: totalContractValue - totalPaid,
      approvedProductionCost,
    };
  }

  /** Jumlah proyek per kategori & status, di-scope sesuai role (PM/Produksi terbatas). */
  async projectCounts(user: AuthUser) {
    const where = this.scopeByRole(user);
    // Agregasi dilakukan di database (groupBy + count), bukan fetch semua row lalu reduce.
    const [byCategoryRows, byStatusRows, total] = await Promise.all([
      this.prisma.project.groupBy({ by: ['category'], where, _count: true }),
      this.prisma.project.groupBy({ by: ['status'], where, _count: true }),
      this.prisma.project.count({ where }),
    ]);
    const byCategory = Object.fromEntries(byCategoryRows.map((r) => [r.category, r._count]));
    const byStatus = Object.fromEntries(byStatusRows.map((r) => [r.status, r._count]));
    return { total, byCategory, byStatus };
  }

  private scopeByRole(user: AuthUser): Prisma.ProjectWhereInput {
    if (user.role === RoleUser.PROJECT_MANAGER) return { projectManagerId: user.id };
    if (user.role === RoleUser.PRODUKSI) return { members: { some: { userId: user.id } } };
    return {};
  }
}
