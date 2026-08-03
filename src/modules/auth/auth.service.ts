import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwt: JwtService) {}

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('Email atau password salah.');
    }
    if (!user.isActive) throw new UnauthorizedException('Akun tidak aktif.');

    const token = await this.jwt.signAsync({ sub: user.id, email: user.email, role: user.role });
    return {
      accessToken: token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    };
  }
}
