import { Injectable } from '@nestjs/common';
import { Prisma, RoleUser, StatusInvoice, StatusProyek, StatusTask } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthUser } from '../../common/decorators/current-user.decorator';

export interface CalendarEvent {
  id: string;
  title: string;
  /** Tanggal mulai event (untuk EVENT: Project Date Start/eventDate). */
  date: Date | null;
  /** Tanggal akhir (untuk EVENT berupa rentang Project Deadlines/eventDate); null untuk titik. */
  endDate: Date | null;
  type: 'EVENT' | 'TASK' | 'INVOICE_DUE';
  projectId: string;
}

@Injectable()
export class CalendarService {
  constructor(private prisma: PrismaService) {}

  /** CalendarEvent bersifat turunan (SDD §5) — tidak dipersistensi, dibangun
   *  on-the-fly dari event proyek, deadline task, dan jatuh tempo invoice.
   *  start/end (opsional) menyaring event ke rentang tanggal yang terlihat. */
  async getEvents(user: AuthUser, start?: string, end?: string): Promise<CalendarEvent[]> {
    const windowStart = start ? new Date(start) : undefined;
    const windowEnd = end ? new Date(end) : undefined;

    const scope: Prisma.ProjectWhereInput =
      user.role === RoleUser.PROJECT_MANAGER ? { projectManagerId: user.id }
      : user.role === RoleUser.PRODUKSI ? { members: { some: { userId: user.id } } }
      : {};

    // Proyek CANCELLED/COMPLETED tidak perlu tampil di kalender.
    const where: Prisma.ProjectWhereInput = {
      ...scope,
      status: { notIn: [StatusProyek.CANCELLED, StatusProyek.COMPLETED] },
    };

    // RBAC: data finansial (jatuh tempo invoice) tidak boleh bocor ke kalender
    // Project Manager maupun Produksi - hanya role finansial yang berhak.
    const canSeeFinance =
      user.role !== RoleUser.PROJECT_MANAGER && user.role !== RoleUser.PRODUKSI;

    // Produksi hanya melihat task yang ditugaskan kepadanya; task DONE disembunyikan.
    const taskWhere: Prisma.TaskWhereInput = {
      status: { not: StatusTask.DONE },
      ...(user.role === RoleUser.PRODUKSI && { assignedToId: user.id }),
    };

    const projects = await this.prisma.project.findMany({
      where,
      select: {
        id: true, name: true, eventDate: true, startDate: true, endDate: true,
        tasks: { where: taskWhere, select: { id: true, title: true, dueDate: true } },
        // Invoice PAID tidak lagi relevan sebagai jatuh tempo.
        invoices: {
          where: { status: { not: StatusInvoice.PAID } },
          select: { id: true, invoiceNumber: true, dueDate: true },
        },
      },
    });

    const events: CalendarEvent[] = [];
    for (const p of projects) {
      // Proyek tampil sebagai rentang. Jika eventDate kosong, pakai startDate agar
      // proyek tetap muncul (bug: sebelumnya hilang saat eventDate kosong).
      const evStart = p.startDate ?? p.eventDate;
      const evEnd = p.endDate ?? p.eventDate ?? p.startDate;
      if (evStart) {
        events.push({ id: `evt-${p.id}`, title: p.name, date: evStart, endDate: evEnd, type: 'EVENT', projectId: p.id });
      }
      p.tasks.forEach((t) => t.dueDate && events.push({ id: `task-${t.id}`, title: t.title, date: t.dueDate, endDate: null, type: 'TASK', projectId: p.id }));
      if (canSeeFinance) {
        p.invoices.forEach((i) => i.dueDate && events.push({ id: `inv-${i.id}`, title: `Jatuh tempo ${i.invoiceNumber}`, date: i.dueDate, endDate: null, type: 'INVOICE_DUE', projectId: p.id }));
      }
    }

    const filtered = events.filter((e) => this.inWindow(e, windowStart, windowEnd));
    return filtered.sort((a, b) => (a.date?.getTime() ?? 0) - (b.date?.getTime() ?? 0));
  }

  /** True bila event (titik atau rentang) beririsan dengan window [start, end]. */
  private inWindow(e: CalendarEvent, start?: Date, end?: Date): boolean {
    if (!e.date) return false;
    const evStart = e.date;
    const evEnd = e.endDate ?? e.date;
    if (start && evEnd < start) return false;
    if (end && evStart > end) return false;
    return true;
  }
}
