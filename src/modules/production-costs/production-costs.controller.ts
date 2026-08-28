import {
  Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { StatusBiaya } from '@prisma/client';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, AuthUser } from '../../common/decorators/current-user.decorator';
import {
  ForbiddenResponse,
  NotFoundResponse,
  UnauthorizedResponse,
} from '../../common/swagger/api-response.schema';
import { ProductionCostsService } from './production-costs.service';
import {
  CreateProductionCostDto, UpdateProductionCostDto, RejectCostDto,
} from './dto/production-cost.dto';

@ApiTags('production-costs')
@ApiBearerAuth()
@Controller('production-costs')
export class ProductionCostsController {
  constructor(private costs: ProductionCostsService) {}

  // Daftar pengajuan untuk Approval Cost (Direktur) — SDD UC09
  @Get('applications')
  @Roles('DIREKTUR')
  @ApiOperation({ summary: 'Daftar pengajuan biaya produksi menunggu approval (DIREKTUR)' })
  @ApiQuery({ name: 'status', enum: StatusBiaya, required: false })
  @ApiOkResponse({ description: 'Daftar pengajuan berhasil diambil.' })
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  applications(@Query('status') status?: StatusBiaya) {
    return this.costs.findApplications(status);
  }

  @Get('project/:projectId')
  @ApiOperation({ summary: 'Ambil daftar biaya produksi berdasarkan proyek' })
  @ApiOkResponse({ description: 'Daftar biaya produksi berhasil diambil.' })
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiNotFoundResponse(NotFoundResponse)
  byProject(@Param('projectId', ParseUUIDPipe) projectId: string) {
    return this.costs.findByProject(projectId);
  }

  @Post()
  @Roles('PROJECT_MANAGER', 'FINANCE', 'DIREKTUR')
  @ApiOperation({ summary: 'Ajukan biaya produksi baru' })
  @ApiCreatedResponse({ description: 'Biaya produksi berhasil diajukan.' })
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  create(@Body() dto: CreateProductionCostDto, @CurrentUser() user: AuthUser) {
    return this.costs.create(dto, user);
  }

  @Patch(':id')
  @Roles('PROJECT_MANAGER', 'FINANCE', 'DIREKTUR')
  @ApiOperation({ summary: 'Update data biaya produksi' })
  @ApiOkResponse({ description: 'Biaya produksi berhasil diperbarui.' })
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiNotFoundResponse(NotFoundResponse)
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateProductionCostDto) {
    return this.costs.update(id, dto);
  }

  @Patch(':id/submit')
  @Roles('PROJECT_MANAGER')
  @ApiOperation({ summary: 'Submit biaya produksi untuk approval (PROJECT_MANAGER)' })
  @ApiOkResponse({ description: 'Biaya produksi berhasil disubmit.' })
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiNotFoundResponse(NotFoundResponse)
  submit(@Param('id', ParseUUIDPipe) id: string) {
    return this.costs.submit(id);
  }

  @Patch(':id/approve')
  @Roles('DIREKTUR')
  @ApiOperation({ summary: 'Approve pengajuan biaya produksi (DIREKTUR)' })
  @ApiOkResponse({ description: 'Biaya produksi berhasil disetujui.' })
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiNotFoundResponse(NotFoundResponse)
  approve(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: AuthUser) {
    return this.costs.approve(id, user);
  }

  @Patch(':id/reject')
  @Roles('DIREKTUR')
  @ApiOperation({ summary: 'Tolak pengajuan biaya produksi (DIREKTUR)' })
  @ApiOkResponse({ description: 'Biaya produksi berhasil ditolak.' })
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiNotFoundResponse(NotFoundResponse)
  reject(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: RejectCostDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.costs.reject(id, dto, user);
  }

  @Delete(':id')
  @Roles('PROJECT_MANAGER', 'FINANCE', 'DIREKTUR')
  @ApiOperation({ summary: 'Hapus biaya produksi' })
  @ApiOkResponse({ description: 'Biaya produksi berhasil dihapus.' })
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiNotFoundResponse(NotFoundResponse)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.costs.remove(id);
  }
}

