import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSkillDto, UpdateSkillDto } from './dto/skill.dto';

@Injectable()
export class SkillsService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.skill.findMany({ orderBy: { name: 'asc' } });
  }

  create(dto: CreateSkillDto) {
    return this.prisma.skill.create({ data: { name: dto.name } });
  }

  async update(id: string, dto: UpdateSkillDto) {
    await this.get(id);
    return this.prisma.skill.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.get(id);
    return this.prisma.skill.delete({ where: { id } });
  }

  /** Set (ganti seluruh) daftar skill milik satu manpower berdasarkan skillIds. */
  async setManpowerSkills(manpowerId: string, skillIds: string[]) {
    const manpower = await this.prisma.manpower.findFirst({
      where: { id: manpowerId, deletedAt: null },
      select: { id: true },
    });
    if (!manpower) throw new NotFoundException('Manpower tidak ditemukan.');

    if (skillIds.length) {
      const found = await this.prisma.skill.count({ where: { id: { in: skillIds } } });
      if (found !== skillIds.length) {
        throw new NotFoundException('Sebagian skill yang dipilih tidak ditemukan.');
      }
    }

    await this.prisma.$transaction([
      this.prisma.manpowerSkill.deleteMany({ where: { manpowerId } }),
      this.prisma.manpowerSkill.createMany({
        data: skillIds.map((skillId) => ({ manpowerId, skillId })),
      }),
    ]);

    return this.prisma.manpower.findUnique({
      where: { id: manpowerId },
      include: { skills: { include: { skill: true } } },
    });
  }

  private async get(id: string) {
    const skill = await this.prisma.skill.findUnique({ where: { id } });
    if (!skill) throw new NotFoundException('Skill tidak ditemukan.');
    return skill;
  }
}
