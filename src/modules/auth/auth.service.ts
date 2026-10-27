import {
  BadRequestException, ConflictException, Injectable, NotFoundException, UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto, UpdateProfileDto } from './dto/profile.dto';

// Select profil lengkap (tanpa passwordHash) — dipakai GET & PATCH /auth/me.
const safeUser = {
  id: true,
  name: true,
  email: true,
  role: true,
  isActive: true,
  dateOfBirth: true,
  phone: true,
  province: true,
  city: true,
  subdistrict: true,
  village: true,
  detailAddress: true,
  bankName: true,
  bankAccountNo: true,
  position: { select: { id: true, name: true } },
  skills: { select: { skill: { select: { id: true, name: true } } } },
  createdAt: true,
} satisfies Prisma.UserSelect;

const BCRYPT_ROUNDS = 12;

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwt: JwtService) {}

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('Email atau password salah.');
    }
    if (!user.isActive) throw new UnauthorizedException('Akun tidak aktif.');

    const token = await this.jwt.signAsync({
      sub: user.id, email: user.email, role: user.role, tv: user.tokenVersion,
    });
    return {
      accessToken: token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    };
  }

  /** Ambil profil lengkap user yang sedang login (tanpa passwordHash). */
  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId }, select: safeUser });
    if (!user) throw new NotFoundException('User tidak ditemukan.');
    return user;
  }

  /** Update profil milik sendiri. passwordHash tidak pernah dikembalikan. */
  async updateProfile(userId: string, dto: UpdateProfileDto) {
    if (dto.email) {
      const taken = await this.prisma.user.findFirst({
        where: { email: dto.email, NOT: { id: userId } },
        select: { id: true },
      });
      if (taken) throw new ConflictException('Email sudah digunakan pengguna lain.');
    }

    if (dto.positionId) {
      const position = await this.prisma.position.findUnique({
        where: { id: dto.positionId },
        select: { id: true },
      });
      if (!position) throw new NotFoundException('Posisi/jabatan tidak ditemukan.');
    }

    if (dto.skillIds?.length) {
      const found = await this.prisma.skill.count({ where: { id: { in: dto.skillIds } } });
      if (found !== dto.skillIds.length) {
        throw new NotFoundException('Sebagian skill yang dipilih tidak ditemukan.');
      }
    }

    const data: Prisma.UserUncheckedUpdateInput = {
      name: dto.name,
      email: dto.email,
      // undefined = tidak diubah; null = dikosongkan; string = diset.
      dateOfBirth: dto.dateOfBirth == null ? dto.dateOfBirth : new Date(dto.dateOfBirth),
      phone: dto.phone,
      province: dto.province,
      city: dto.city,
      subdistrict: dto.subdistrict,
      village: dto.village,
      detailAddress: dto.detailAddress,
      bankName: dto.bankName,
      bankAccountNo: dto.bankAccountNo,
      positionId: dto.positionId, // scalar FK: aman untuk set/clear (SetNull)
    };

    // Jalankan dalam satu transaksi agar update skill (ganti seluruh daftar) atomik.
    await this.prisma.$transaction(async (tx) => {
      await tx.user.update({ where: { id: userId }, data });
      if (dto.skillIds) {
        await tx.userSkill.deleteMany({ where: { userId } });
        if (dto.skillIds.length) {
          await tx.userSkill.createMany({
            data: dto.skillIds.map((skillId) => ({ userId, skillId })),
          });
        }
      }
    });

    return this.getProfile(userId);
  }

  /** Ganti password: verifikasi password lama, hash baru dengan bcrypt cost 12. */
  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException();
    if (!(await bcrypt.compare(dto.oldPassword, user.passwordHash))) {
      throw new BadRequestException('Password lama tidak sesuai.');
    }
    const passwordHash = await bcrypt.hash(dto.newPassword, BCRYPT_ROUNDS);
    // Naikkan tokenVersion agar seluruh token lama (JWT sebelum ganti password) invalid.
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash, tokenVersion: { increment: 1 } },
    });
    return { message: 'Password berhasil diperbarui.' };
  }
}
