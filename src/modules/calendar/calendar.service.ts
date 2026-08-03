import { Injectable } from '@nestjs/common';
import { RoleUser } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthUser } from '../../common/decorators/current-user.decorator';

export interface CalendarEvent {
  id: string;
  title: string;
  date: Date | null;
  type: 'EVENT' | 'TASK' | 'INVOICE_DUE';
  projectId: string;
}

@Injectable()
export class CalendarService {
  constructor(private prisma: PrismaService) {}

  /** CalendarEvent bersifat turunan (SDD §5) — tidak dipersistensi, dibangun
   *  on-the-fly dari event proyek, deadline task, dan jatuh tempo invoice. */
  async getEvents(user: AuthUser): Promise<CalendarEvent[]> {
    const scope =
      user.role === RoleUser.PROJECT_MANAGER ? { projectManagerId: user.id }
      : user.role === RoleUser.PRODUKSI ? { members: { some: { userId: user.id } } }
      : {};

    const projects = await this.prisma.project.findMany({
      where: scope,
      select: {
        id: true, name: true, eventDate: true,
        tasks: { select: { id: true, title: true, dueDate: true } },
        invoices: { select: { id: true, invoiceNumber: true, dueDate: true } },
      },
    });

    const events: CalendarEvent[] = [];
    for (const p of projects) {
      if (p.eventDate) events.push({ id: `evt-${p.id}`, title: p.name, date: p.eventDate, type: 'EVENT', projectId: p.id });
      p.tasks.forEach((t) => t.dueDate && events.push({ id: `task-${t.id}`, title: t.title, date: t.dueDate, type: 'TASK', projectId: p.id }));
      p.invoices.forEach((i) => i.dueDate && events.push({ id: `inv-${i.id}`, title: `Jatuh tempo ${i.invoiceNumber}`, date: i.dueDate, type: 'INVOICE_DUE', projectId: p.id }));
    }
    return events.sort((a, b) => (a.date?.getTime() ?? 0) - (b.date?.getTime() ?? 0));
  }
}
