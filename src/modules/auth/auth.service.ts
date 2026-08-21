import {
  BadRequestException, ConflictException, Injectable, UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto, UpdateProfileDto } from './dto/profile.dto';

const safeUser = { id: true, name: true, email: true, role: true, isActive: true, createdAt: true };
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

  /** Update profil milik sendiri (nama/email). passwordHash tidak pernah dikembalikan. */
  async updateProfile(userId: string, dto: UpdateProfileDto) {
    if (dto.email) {
      const taken = await this.prisma.user.findFirst({
        where: { email: dto.email, NOT: { id: userId } },
        select: { id: true },
      });
      if (taken) throw new ConflictException('Email sudah digunakan pengguna lain.');
    }
    return this.prisma.user.update({
      where: { id: userId },
      data: { name: dto.name, email: dto.email },
      select: safeUser,
    });
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
