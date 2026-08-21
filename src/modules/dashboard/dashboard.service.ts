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
    const projects = await this.prisma.project.findMany({
      where: this.scopeByRole(user),
      select: { category: true, status: true },
    });
    const byCategory: Record<string, number> = {};
    const byStatus: Record<string, number> = {};
    for (const p of projects) {
      byCategory[p.category] = (byCategory[p.category] ?? 0) + 1;
      byStatus[p.status] = (byStatus[p.status] ?? 0) + 1;
    }
    return { total: projects.length, byCategory, byStatus };
  }

  private scopeByRole(user: AuthUser): Prisma.ProjectWhereInput {
    if (user.role === RoleUser.PROJECT_MANAGER) return { projectManagerId: user.id };
    if (user.role === RoleUser.PRODUKSI) return { members: { some: { userId: user.id } } };
    return {};
  }
}
