import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { UpsertManpowerDto } from './dto/manpower.dto';
import { QueryManpowerDto } from './dto/query-manpower.dto';
import { getSkipTake, createPaginatedResponse } from '../../common/pagination/pagination.helper';

@Injectable()
export class ManpowerService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: QueryManpowerDto) {
    const where: Prisma.ManpowerWhereInput = {
      deletedAt: null,
      ...(query.employmentStatus && { employmentStatus: query.employmentStatus }),
      ...(query.positionId && { positionId: query.positionId }),
      ...(query.skillId && {
        skills: {
          some: {
            skillId: query.skillId,
          },
        },
      }),
      ...(query.search && {
        OR: [
          { name: { contains: query.search, mode: 'insensitive' } },
          { position: { contains: query.search, mode: 'insensitive' } },
          { email: { contains: query.search, mode: 'insensitive' } },
          { skill: { contains: query.search, mode: 'insensitive' } },
        ],
      }),
    };

    const total = await this.prisma.manpower.count({ where });
    const { skip, take } = getSkipTake(query);

    const allowedSortFields = ['name', 'position', 'employmentStatus', 'createdAt'];
    const sortField = allowedSortFields.includes(query.sort ?? '') ? query.sort! : 'name';
    const order = query.order ?? 'asc';

    const data = await this.prisma.manpower.findMany({
      where,
      orderBy: { [sortField]: order },
      skip,
      take,
      include: { positionRef: true, skills: { include: { skill: true } } },
    });

    return createPaginatedResponse(data, total, query);
  }

  async findOne(id: string) {
    const manpower = await this.prisma.manpower.findFirst({
      where: { id, deletedAt: null },
      include: { positionRef: true, skills: { include: { skill: true } } },
    });
    if (!manpower) throw new NotFoundException('Manpower tidak ditemukan.');
    return manpower;
  }

  async create(dto: UpsertManpowerDto) {
    await this.ensurePositionExists(dto.positionId);
    return this.prisma.manpower.create({ data: dto, include: { positionRef: true } });
  }

  async update(id: string, dto: UpsertManpowerDto) {
    await this.ensureExists(id);
    await this.ensurePositionExists(dto.positionId);
    return this.prisma.manpower.update({ where: { id }, data: dto, include: { positionRef: true } });
  }

  async remove(id: string) {
    await this.ensureExists(id);
    return this.prisma.manpower.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  private async ensureExists(id: string) {
    const f = await this.prisma.manpower.findFirst({ where: { id, deletedAt: null } });
    if (!f) throw new NotFoundException('Manpower tidak ditemukan.');
  }

  private async ensurePositionExists(positionId?: string) {
    if (!positionId) return;
    const position = await this.prisma.position.findUnique({
      where: { id: positionId },
      select: { id: true },
    });
    if (!position) throw new NotFoundException('Posisi/jabatan tidak ditemukan.');
  }
}
