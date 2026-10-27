import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePositionDto, UpdatePositionDto } from './dto/position.dto';

@Injectable()
export class PositionsService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.position.findMany({ orderBy: { name: 'asc' } });
  }

  async findOne(id: string) {
    return this.get(id);
  }

  create(dto: CreatePositionDto) {
    return this.prisma.position.create({ data: { name: dto.name } });
  }

  async update(id: string, dto: UpdatePositionDto) {
    await this.get(id);
    return this.prisma.position.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.get(id);
    // FK di User & Manpower ber-onDelete: SetNull, jadi penghapusan aman.
    return this.prisma.position.delete({ where: { id } });
  }

  private async get(id: string) {
    const position = await this.prisma.position.findUnique({ where: { id } });
    if (!position) throw new NotFoundException('Posisi/jabatan tidak ditemukan.');
    return position;
  }
}
