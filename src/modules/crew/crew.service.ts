import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpsertCrewDto } from './dto/crew.dto';

@Injectable()
export class CrewService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.crew.findMany({
      where: { deletedAt: null },
      orderBy: { name: 'asc' },
    });
  }

  create(dto: UpsertCrewDto) {
    return this.prisma.crew.create({ data: dto });
  }

  async update(id: string, dto: UpsertCrewDto) {
    await this.ensureExists(id);
    return this.prisma.crew.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.ensureExists(id);
    return this.prisma.crew.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  private async ensureExists(id: string) {
    const f = await this.prisma.crew.findFirst({ where: { id, deletedAt: null } });
    if (!f) throw new NotFoundException('Crew tidak ditemukan.');
  }
}
