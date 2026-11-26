import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { assertProjectEditable } from '../../common/services/project-status.util';

@Injectable()
export class ProjectMembersService {
  constructor(private prisma: PrismaService) {}

  async list(projectId: string) {
    await this.ensureProject(projectId);
    return this.prisma.projectMember.findMany({
      where: { projectId },
      include: { user: { select: { id: true, name: true, email: true, role: true } } },
      orderBy: { joinedAt: 'asc' },
    });
  }

  async add(projectId: string, userId: string) {
    await this.ensureProject(projectId);
    await assertProjectEditable(this.prisma, projectId);
    const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
    if (!user) throw new NotFoundException('User tidak ditemukan.');

    const existing = await this.prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId } },
    });
    if (existing) throw new ConflictException('User sudah menjadi anggota proyek ini.');

    return this.prisma.projectMember.create({
      data: { projectId, userId },
      include: { user: { select: { id: true, name: true, email: true, role: true } } },
    });
  }

  async remove(projectId: string, userId: string) {
    await assertProjectEditable(this.prisma, projectId);
    const member = await this.prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId } },
    });
    if (!member) throw new NotFoundException('Anggota proyek tidak ditemukan.');
    return this.prisma.projectMember.delete({
      where: { projectId_userId: { projectId, userId } },
    });
  }

  private async ensureProject(projectId: string) {
    const p = await this.prisma.project.findUnique({ where: { id: projectId }, select: { id: true } });
    if (!p) throw new NotFoundException('Proyek tidak ditemukan.');
  }
}
