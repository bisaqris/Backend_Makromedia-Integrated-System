import { RoleUser } from '@prisma/client';
import { ProjectsService } from './projects.service';

describe('ProjectsService (RBAC scoping)', () => {
  let service: ProjectsService;
  let prisma: any;

  beforeEach(() => {
    prisma = { project: { findMany: jest.fn().mockResolvedValue([]) } };
    service = new ProjectsService(prisma);
  });

  it('PM hanya melihat proyek yang ia kelola', async () => {
    await service.findAll({} as any, { id: 'pm1', role: RoleUser.PROJECT_MANAGER } as any);
    expect(prisma.project.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ projectManagerId: 'pm1' }) }),
    );
  });

  it('Produksi hanya melihat proyek tempat ia menjadi member', async () => {
    await service.findAll({} as any, { id: 'pr1', role: RoleUser.PRODUKSI } as any);
    expect(prisma.project.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ members: { some: { userId: 'pr1' } } }),
      }),
    );
  });

  it('Direktur melihat semua (tanpa filter scoping)', async () => {
    await service.findAll({} as any, { id: 'dir', role: RoleUser.DIREKTUR } as any);
    const arg = prisma.project.findMany.mock.calls[0][0];
    expect(arg.where.projectManagerId).toBeUndefined();
    expect(arg.where.members).toBeUndefined();
  });
});
