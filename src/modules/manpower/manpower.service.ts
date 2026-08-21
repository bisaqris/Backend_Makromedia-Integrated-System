import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpsertManpowerDto } from './dto/manpower.dto';

@Injectable()
export class ManpowerService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.manpower.findMany({
      where: { deletedAt: null },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const manpower = await this.prisma.manpower.findFirst({
      where: { id, deletedAt: null },
      include: { skills: { include: { skill: true } } },
    });
    if (!manpower) throw new NotFoundException('Manpower tidak ditemukan.');
    return manpower;
  }

  create(dto: UpsertManpowerDto) {
    return this.prisma.manpower.create({ data: dto });
  }

  async update(id: string, dto: UpsertManpowerDto) {
    await this.ensureExists(id);
    return this.prisma.manpower.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.ensureExists(id);
    return this.prisma.manpower.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  private async ensureExists(id: string) {
    const f = await this.prisma.manpower.findFirst({ where: { id, deletedAt: null } });
    if (!f) throw new NotFoundException('Manpower tidak ditemukan.');
  }
}
