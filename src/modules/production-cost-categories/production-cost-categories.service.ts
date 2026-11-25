import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateProductionCostCategoryDto,
  UpdateProductionCostCategoryDto,
} from './dto/production-cost-category.dto';

@Injectable()
export class ProductionCostCategoriesService {
  constructor(private prisma: PrismaService) {}

  /** activeOnly=true menyaring hanya kategori aktif (untuk dropdown pilihan). */
  findAll(activeOnly = false) {
    return this.prisma.productionCostCategory.findMany({
      where: activeOnly ? { isActive: true } : undefined,
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    return this.get(id);
  }

  async create(dto: CreateProductionCostCategoryDto) {
    try {
      return await this.prisma.productionCostCategory.create({
        data: { name: dto.name, isActive: dto.isActive },
      });
    } catch (e) {
      throw this.mapUniqueError(e);
    }
  }

  async update(id: string, dto: UpdateProductionCostCategoryDto) {
    await this.get(id);
    try {
      return await this.prisma.productionCostCategory.update({ where: { id }, data: dto });
    } catch (e) {
      throw this.mapUniqueError(e);
    }
  }

  async remove(id: string) {
    await this.get(id);
    return this.prisma.productionCostCategory.delete({ where: { id } });
  }

  private async get(id: string) {
    const category = await this.prisma.productionCostCategory.findUnique({ where: { id } });
    if (!category) throw new NotFoundException('Kategori biaya produksi tidak ditemukan.');
    return category;
  }

  private mapUniqueError(e: unknown) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      return new ConflictException('Nama kategori sudah digunakan.');
    }
    return e;
  }
}
