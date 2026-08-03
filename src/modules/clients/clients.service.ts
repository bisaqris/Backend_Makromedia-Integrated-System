import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpsertClientDto } from './dto/client.dto';

@Injectable()
export class ClientsService {
  constructor(private prisma: PrismaService) {}
  findAll() {
    return this.prisma.client.findMany({
      where: { deletedAt: null }, include: { company: true }, orderBy: { name: 'asc' },
    });
  }
  create(dto: UpsertClientDto) { return this.prisma.client.create({ data: dto }); }
  async update(id: string, dto: UpsertClientDto) {
    await this.ensure(id);
    return this.prisma.client.update({ where: { id }, data: dto });
  }
  async remove(id: string) {
    await this.ensure(id);
    return this.prisma.client.update({ where: { id }, data: { deletedAt: new Date() } });
  }
  private async ensure(id: string) {
    const f = await this.prisma.client.findFirst({ where: { id, deletedAt: null } });
    if (!f) throw new NotFoundException('Client (PIC) tidak ditemukan.');
  }
}
