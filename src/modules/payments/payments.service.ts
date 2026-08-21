import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePaymentDto } from './dto/payment.dto';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  async create(projectId: string, dto: CreatePaymentDto) {
    await this.ensureProject(projectId);
    return this.prisma.payment.create({
      data: {
        projectId,
        amount: dto.amount,
        paymentMethod: dto.paymentMethod,
        bankTo: dto.bankTo,
        bankAccount: dto.bankAccount,
        note: dto.note,
        paidAt: dto.paidAt ? new Date(dto.paidAt) : undefined,
      },
    });
  }

  /** Riwayat pembayaran + ringkasan Total Paid / Rest of Bill (contractValue - totalPaid). */
  async findByProject(projectId: string) {
    const project = await this.ensureProject(projectId);
    const payments = await this.prisma.payment.findMany({
      where: { projectId },
      orderBy: { paidAt: 'desc' },
    });
    const agg = await this.prisma.payment.aggregate({
      where: { projectId },
      _sum: { amount: true },
    });
    const totalPaid = Number(agg._sum.amount ?? 0);
    const contractValue = Number(project.contractValue);
    return {
      payments,
      summary: { contractValue, totalPaid, restOfBill: contractValue - totalPaid },
    };
  }

  private async ensureProject(projectId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true, contractValue: true },
    });
    if (!project) throw new NotFoundException('Proyek tidak ditemukan.');
    return project;
  }
}
