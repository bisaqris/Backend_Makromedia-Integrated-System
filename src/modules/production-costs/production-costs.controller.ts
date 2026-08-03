import {
  Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { StatusBiaya } from '@prisma/client';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, AuthUser } from '../../common/decorators/current-user.decorator';
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
  applications(@Query('status') status?: StatusBiaya) {
    return this.costs.findApplications(status);
  }

  @Get('project/:projectId')
  byProject(@Param('projectId', ParseUUIDPipe) projectId: string) {
    return this.costs.findByProject(projectId);
  }

  @Post()
  @Roles('PROJECT_MANAGER', 'FINANCE', 'DIREKTUR')
  create(@Body() dto: CreateProductionCostDto, @CurrentUser() user: AuthUser) {
    return this.costs.create(dto, user);
  }

  @Patch(':id')
  @Roles('PROJECT_MANAGER', 'FINANCE', 'DIREKTUR')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateProductionCostDto) {
    return this.costs.update(id, dto);
  }

  @Patch(':id/submit')
  @Roles('PROJECT_MANAGER')
  submit(@Param('id', ParseUUIDPipe) id: string) {
    return this.costs.submit(id);
  }

  @Patch(':id/approve')
  @Roles('DIREKTUR')
  approve(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: AuthUser) {
    return this.costs.approve(id, user);
  }

  @Patch(':id/reject')
  @Roles('DIREKTUR')
  reject(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: RejectCostDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.costs.reject(id, dto, user);
  }

  @Delete(':id')
  @Roles('PROJECT_MANAGER', 'FINANCE', 'DIREKTUR')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.costs.remove(id);
  }
}
