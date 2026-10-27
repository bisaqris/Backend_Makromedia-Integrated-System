import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { RoleUser } from '@prisma/client';
import { ProjectAccessService } from './project-access.service';

describe('ProjectAccessService', () => {
  let service: ProjectAccessService;
  let prisma: any;

  beforeEach(() => {
    prisma = { project: { findUnique: jest.fn() } };
    service = new ProjectAccessService(prisma);
  });

  it('Direktur boleh akses proyek apa pun', async () => {
    prisma.project.findUnique.mockResolvedValue({ id: 'p1', projectManagerId: 'other' });
    await expect(
      service.assertCanAccess('p1', { id: 'd', role: RoleUser.DIREKTUR } as any),
    ).resolves.toBeUndefined();
  });

  it('PM ditolak (403) untuk proyek yang bukan miliknya', async () => {
    prisma.project.findUnique.mockResolvedValue({ id: 'p1', projectManagerId: 'other-pm' });
    await expect(
      service.assertCanAccess('p1', { id: 'pm1', role: RoleUser.PROJECT_MANAGER } as any),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('PM boleh akses proyek yang ia kelola', async () => {
    prisma.project.findUnique.mockResolvedValue({ id: 'p1', projectManagerId: 'pm1' });
    await expect(
      service.assertCanAccess('p1', { id: 'pm1', role: RoleUser.PROJECT_MANAGER } as any),
    ).resolves.toBeUndefined();
  });

  it('Produksi ditolak (403) bila bukan anggota proyek', async () => {
    prisma.project.findUnique.mockResolvedValue({ id: 'p1', projectManagerId: 'x', members: [] });
    await expect(
      service.assertCanAccess('p1', { id: 'pr1', role: RoleUser.PRODUKSI } as any),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('Produksi boleh bila menjadi anggota proyek', async () => {
    prisma.project.findUnique.mockResolvedValue({
      id: 'p1', projectManagerId: 'x', members: [{ userId: 'pr1' }],
    });
    await expect(
      service.assertCanAccess('p1', { id: 'pr1', role: RoleUser.PRODUKSI } as any),
    ).resolves.toBeUndefined();
  });

  it('melempar 404 bila proyek tidak ditemukan', async () => {
    prisma.project.findUnique.mockResolvedValue(null);
    await expect(
      service.assertCanAccess('x', { id: 'd', role: RoleUser.DIREKTUR } as any),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
