import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProjectLinkDto, UpdateProjectLinkDto } from './dto/project-link.dto';

@Injectable()
export class ProjectLinksService {
  constructor(private prisma: PrismaService) {}

  async findAll(projectId: string) {
    await this.ensureProject(projectId);
    return this.prisma.projectLink.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(projectId: string, dto: CreateProjectLinkDto) {
    await this.ensureProject(projectId);
    return this.prisma.projectLink.create({
      data: { projectId, label: dto.label, url: dto.url },
    });
  }

  async update(projectId: string, linkId: string, dto: UpdateProjectLinkDto) {
    await this.getLink(projectId, linkId);
    return this.prisma.projectLink.update({ where: { id: linkId }, data: dto });
  }

  async remove(projectId: string, linkId: string) {
    await this.getLink(projectId, linkId);
    return this.prisma.projectLink.delete({ where: { id: linkId } });
  }

  private async ensureProject(projectId: string) {
    const p = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true },
    });
    if (!p) throw new NotFoundException('Proyek tidak ditemukan.');
  }

  private async getLink(projectId: string, linkId: string) {
    const link = await this.prisma.projectLink.findFirst({ where: { id: linkId, projectId } });
    if (!link) throw new NotFoundException('Link proyek tidak ditemukan.');
    return link;
  }
}
