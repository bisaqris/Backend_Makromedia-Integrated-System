import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: any;
  let jwt: any;

  beforeEach(() => {
    prisma = { user: { findUnique: jest.fn(), update: jest.fn() } };
    jwt = { signAsync: jest.fn().mockResolvedValue('token123') };
    service = new AuthService(prisma, jwt);
  });

  describe('login', () => {
    it('mengembalikan accessToken + user saat kredensial benar', async () => {
      const passwordHash = await bcrypt.hash('secret12', 10);
      prisma.user.findUnique.mockResolvedValue({
        id: 'u1', email: 'a@b.c', name: 'A', role: 'SALES', isActive: true, passwordHash,
      });
      const res = await service.login({ email: 'a@b.c', password: 'secret12' } as any);
      expect(res.accessToken).toBe('token123');
      expect(res.user).toEqual({ id: 'u1', name: 'A', email: 'a@b.c', role: 'SALES' });
    });

    it('menolak (401) saat password salah', async () => {
      const passwordHash = await bcrypt.hash('correctpw', 10);
      prisma.user.findUnique.mockResolvedValue({ id: 'u1', passwordHash, isActive: true });
      await expect(
        service.login({ email: 'a@b.c', password: 'wrongpw1' } as any),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('menolak (401) saat user tidak ditemukan', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      await expect(
        service.login({ email: 'x@y.z', password: 'whatever' } as any),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('menolak (401) saat akun non-aktif', async () => {
      const passwordHash = await bcrypt.hash('secret12', 10);
      prisma.user.findUnique.mockResolvedValue({ id: 'u1', passwordHash, isActive: false });
      await expect(
        service.login({ email: 'a@b.c', password: 'secret12' } as any),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });
  });

  describe('changePassword', () => {
    it('menolak (400) saat password lama salah', async () => {
      const passwordHash = await bcrypt.hash('oldpass12', 10);
      prisma.user.findUnique.mockResolvedValue({ id: 'u1', passwordHash });
      await expect(
        service.changePassword('u1', { oldPassword: 'salah123', newPassword: 'newpass12' } as any),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('meng-hash & update saat password lama benar', async () => {
      const passwordHash = await bcrypt.hash('oldpass12', 10);
      prisma.user.findUnique.mockResolvedValue({ id: 'u1', passwordHash });
      prisma.user.update.mockResolvedValue({});
      const res = await service.changePassword('u1', {
        oldPassword: 'oldpass12', newPassword: 'newpass12',
      } as any);
      expect(prisma.user.update).toHaveBeenCalled();
      expect(res.message).toContain('berhasil');
    });
  });
});
