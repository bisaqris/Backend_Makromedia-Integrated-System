import { Injectable, NotFoundException } from '@nestjs/common';
import { StatusTask } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthUser } from '../../common/decorators/current-user.decorator';
import { ProjectAccessService } from '../../common/services/project-access.service';
import { CreateTaskDto, UpdateTaskDto } from './dto/task.dto';

@Injectable()
export class TasksService {
  constructor(
    private prisma: PrismaService,
    private access: ProjectAccessService,
  ) {}

  async findByProject(projectId: string, user: AuthUser) {
    await this.access.assertCanAccess(projectId, user);
    return this.prisma.task.findMany({
      where: { projectId },
      include: { assignedTo: { select: { id: true, name: true, role: true } } },
      orderBy: { createdAt: 'asc' },
    });
  }

  async create(projectId: string, dto: CreateTaskDto, user: AuthUser) {
    await this.access.assertCanAccess(projectId, user);
    return this.prisma.task.create({
      data: {
        projectId,
        title: dto.title,
        assignedToId: dto.assignedToId,
        description: dto.description,
        status: dto.status,
        progress: dto.progress ?? 0,
        notes: dto.notes,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
      },
    });
  }

  async update(id: string, dto: UpdateTaskDto, user: AuthUser) {
    const task = await this.get(id);
    await this.access.assertCanAccess(task.projectId, user);
    return this.prisma.task.update({
      where: { id },
      data: {
        ...dto,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
      },
    });
  }

  /**
   * Update progress task (0-100). Status task otomatis diselaraskan dengan progress,
   * dan snapshot rata-rata progress proyek dicatat ke ProjectProgress (audit trail).
   */
  async updateProgress(id: string, progress: number, user: AuthUser) {
    const task = await this.get(id);
    await this.access.assertCanAccess(task.projectId, user);
    const status =
      progress === 0 ? StatusTask.TODO : progress >= 100 ? StatusTask.DONE : StatusTask.IN_PROGRESS;

    // Update task + snapshot progress proyek dilakukan atomik (satu transaksi).
    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.task.update({ where: { id }, data: { progress, status } });

      const agg = await tx.task.aggregate({
        where: { projectId: task.projectId },
        _avg: { progress: true },
      });
      await tx.projectProgress.create({
        data: {
          projectId: task.projectId,
          createdById: user.id,
          percentage: agg._avg.progress ?? 0,
          notes: `Update progress task "${task.title}" menjadi ${progress}%`,
        },
      });

      return updated;
    });
  }

  async remove(id: string, user: AuthUser) {
    const task = await this.get(id);
    await this.access.assertCanAccess(task.projectId, user);
    return this.prisma.task.delete({ where: { id } });
  }

  private async get(id: string) {
    const task = await this.prisma.task.findUnique({ where: { id } });
    if (!task) throw new NotFoundException('Task tidak ditemukan.');
    return task;
  }
}
