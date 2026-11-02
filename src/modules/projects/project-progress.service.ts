import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProjectProgressDto, UpdateProjectProgressDto } from './dto/project-progress.dto';

const withAuthor = {
  include: { createdBy: { select: { id: true, name: true, role: true } } },
};

@Injectable()
export class ProjectProgressService {
  constructor(private prisma: PrismaService) {}

  async findAll(projectId: string) {
    await this.ensureProject(projectId);
    return this.prisma.projectProgress.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
      ...withAuthor,
    });
  }

  async create(projectId: string, userId: string, dto: CreateProjectProgressDto) {
    await this.ensureProject(projectId);
    return this.prisma.projectProgress.create({
      data: { projectId, createdById: userId, percentage: dto.percentage, notes: dto.notes },
      ...withAuthor,
    });
  }

  async update(projectId: string, progressId: string, dto: UpdateProjectProgressDto) {
    await this.getProgress(projectId, progressId);
    return this.prisma.projectProgress.update({
      where: { id: progressId },
      data: { percentage: dto.percentage, notes: dto.notes },
      ...withAuthor,
    });
  }

  async remove(projectId: string, progressId: string) {
    await this.getProgress(projectId, progressId);
    return this.prisma.projectProgress.delete({ where: { id: progressId } });
  }

  private async ensureProject(projectId: string) {
    const p = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true },
    });
    if (!p) throw new NotFoundException('Proyek tidak ditemukan.');
  }

  private async getProgress(projectId: string, progressId: string) {
    const prog = await this.prisma.projectProgress.findFirst({
      where: { id: progressId, projectId },
    });
    if (!prog) throw new NotFoundException('Progress proyek tidak ditemukan.');
    return prog;
  }
}
