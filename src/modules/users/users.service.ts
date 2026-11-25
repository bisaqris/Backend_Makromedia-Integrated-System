import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';

const safe = { id: true, name: true, email: true, role: true, isActive: true, createdAt: true };
const BCRYPT_ROUNDS = 12;

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.user.findMany({ select: safe, orderBy: { createdAt: 'desc' } });
  }

  /** Daftar user role PROJECT_MANAGER yang aktif - untuk dropdown/filter di form proyek. */
  findProjectManagers() {
    return this.prisma.user.findMany({
      where: { role: 'PROJECT_MANAGER', isActive: true },
      select: { id: true, name: true, email: true, role: true },
      orderBy: { name: 'asc' },
    });
  }

  /** Daftar user role PRODUKSI yang aktif - untuk assign task & tambah anggota tim proyek. */
  findProductionTeam() {
    return this.prisma.user.findMany({
      where: { role: 'PRODUKSI', isActive: true },
      select: { id: true, name: true, email: true, role: true },
      orderBy: { name: 'asc' },
    });
  }

  async create(dto: CreateUserDto) {
    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    return this.prisma.user.create({
      data: { name: dto.name, email: dto.email, role: dto.role, passwordHash },
      select: safe,
    });
  }
}
