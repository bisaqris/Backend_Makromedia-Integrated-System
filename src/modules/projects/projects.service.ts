import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, RoleUser } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthUser } from '../../common/decorators/current-user.decorator';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { QueryProjectDto } from './dto/query-project.dto';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: QueryProjectDto, user: AuthUser) {
    const where: Prisma.ProjectWhereInput = {
      ...(query.search && { name: { contains: query.search, mode: 'insensitive' } }),
      ...(query.category && { category: query.category }),
      ...(query.status && { status: query.status }),
      // RBAC scoping: PM hanya lihat proyek yang ia kelola; Produksi hanya
      // proyek tempat ia menjadi member. Role lain melihat semua.
      ...(user.role === RoleUser.PROJECT_MANAGER && { projectManagerId: user.id }),
      ...(user.role === RoleUser.PRODUKSI && { members: { some: { userId: user.id } } }),
    };

    return this.prisma.project.findMany({
      where,
      include: {
        client: { include: { company: true } },
        projectManager: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, user: AuthUser) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        client: { include: { company: true } },
        projectManager: { select: { id: true, name: true } },
        members: { include: { user: { select: { id: true, name: true, role: true } } } },
        links: true,
        tasks: true,
        quotations: { include: { items: true } },
        invoices: { include: { items: true } },
        payments: true,
        // Data finansial disembunyikan dari role Produksi (SDD — UC05)
        ...(user.role !== RoleUser.PRODUKSI && {
          productionCosts: true,
        }),
      },
    });
    if (!project) throw new NotFoundException('Proyek tidak ditemukan.');
    return project;
  }

  create(dto: CreateProjectDto, user: AuthUser) {
    return this.prisma.project.create({
      data: {
        name: dto.name,
        description: dto.description,
        category: dto.category,
        clientId: dto.clientId,
        createdById: user.id,
        projectManagerId: dto.projectManagerId,
        clientType: dto.clientType,
        partnershipModel: dto.partnershipModel,
        venue: dto.venue,
        contractValue: dto.contractValue ?? 0,
        eventDate: dto.eventDate ? new Date(dto.eventDate) : undefined,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      },
    });
  }

  async update(id: string, dto: UpdateProjectDto) {
    await this.ensureExists(id);
    return this.prisma.project.update({
      where: { id },
      data: {
        ...dto,
        eventDate: dto.eventDate ? new Date(dto.eventDate) : undefined,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      },
    });
  }

  async remove(id: string) {
    await this.ensureExists(id);
    return this.prisma.project.delete({ where: { id } });
  }

  private async ensureExists(id: string) {
    const found = await this.prisma.project.findUnique({ where: { id }, select: { id: true } });
    if (!found) throw new NotFoundException('Proyek tidak ditemukan.');
  }
}
