import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { RoleUser } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthUser } from '../decorators/current-user.decorator';

/**
 * Otorisasi tingkat proyek (mencegah IDOR pada sub-resource).
 *
 * Scoping mengikuti RBAC: Project Manager hanya boleh mengakses proyek yang ia
 * kelola, Produksi hanya proyek tempat ia menjadi anggota, sedangkan Sales /
 * Finance / Direktur boleh mengakses seluruh proyek.
 */
@Injectable()
export class ProjectAccessService {
  constructor(private prisma: PrismaService) {}

  async assertCanAccess(projectId: string, user: AuthUser): Promise<void> {
    const scoped =
      user.role === RoleUser.PROJECT_MANAGER || user.role === RoleUser.PRODUKSI;

    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: {
        id: true,
        projectManagerId: true,
        ...(user.role === RoleUser.PRODUKSI && {
          members: { where: { userId: user.id }, select: { userId: true } },
        }),
      },
    });
    if (!project) throw new NotFoundException('Proyek tidak ditemukan.');
    if (!scoped) return;

    if (user.role === RoleUser.PROJECT_MANAGER && project.projectManagerId !== user.id) {
      throw new ForbiddenException('Anda bukan Project Manager proyek ini.');
    }
    if (user.role === RoleUser.PRODUKSI && (project.members?.length ?? 0) === 0) {
      throw new ForbiddenException('Anda bukan anggota proyek ini.');
    }
  }
}
