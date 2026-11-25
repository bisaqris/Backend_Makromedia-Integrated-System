import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import {
  ForbiddenResponse,
  NotFoundResponse,
  UnauthorizedResponse,
} from '../../common/swagger/api-response.schema';
import { ProductionCostCategoriesService } from './production-cost-categories.service';
import {
  CreateProductionCostCategoryDto,
  UpdateProductionCostCategoryDto,
} from './dto/production-cost-category.dto';

@ApiTags('production-cost-categories')
@ApiBearerAuth()
@Controller('production-cost-categories')
export class ProductionCostCategoriesController {
  constructor(private svc: ProductionCostCategoriesService) {}

  @Get()
  @ApiOperation({ summary: 'Ambil daftar kategori biaya produksi (active=true untuk hanya yang aktif)' })
  @ApiQuery({ name: 'active', required: false, type: Boolean, description: 'true = hanya kategori aktif' })
  @ApiOkResponse({ description: 'Daftar kategori berhasil diambil.' })
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  findAll(@Query('active') active?: string) {
    return this.svc.findAll(active === 'true');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Ambil detail kategori biaya produksi berdasarkan ID' })
  @ApiOkResponse({ description: 'Detail kategori berhasil diambil.' })
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiNotFoundResponse(NotFoundResponse)
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.svc.findOne(id);
  }

  @Post()
  @Roles('DIREKTUR')
  @ApiOperation({ summary: 'Tambah kategori biaya produksi (DIREKTUR)' })
  @ApiCreatedResponse({ description: 'Kategori berhasil dibuat.' })
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiConflictResponse({ description: 'Nama kategori sudah digunakan.' })
  create(@Body() dto: CreateProductionCostCategoryDto) {
    return this.svc.create(dto);
  }

  @Patch(':id')
  @Roles('DIREKTUR')
  @ApiOperation({ summary: 'Update kategori biaya produksi (DIREKTUR)' })
  @ApiOkResponse({ description: 'Kategori berhasil diperbarui.' })
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiNotFoundResponse(NotFoundResponse)
  @ApiConflictResponse({ description: 'Nama kategori sudah digunakan.' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateProductionCostCategoryDto) {
    return this.svc.update(id, dto);
  }

  @Delete(':id')
  @Roles('DIREKTUR')
  @ApiOperation({ summary: 'Hapus kategori biaya produksi (DIREKTUR)' })
  @ApiOkResponse({ description: 'Kategori berhasil dihapus.' })
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiNotFoundResponse(NotFoundResponse)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.svc.remove(id);
  }
}
