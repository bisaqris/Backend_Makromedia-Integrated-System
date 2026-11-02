import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, AuthUser } from '../../common/decorators/current-user.decorator';
import {
  ForbiddenResponse,
  NotFoundResponse,
  UnauthorizedResponse,
} from '../../common/swagger/api-response.schema';
import { ProjectProgressService } from './project-progress.service';
import { CreateProjectProgressDto, UpdateProjectProgressDto } from './dto/project-progress.dto';

@ApiTags('project-progress')
@ApiBearerAuth()
@Controller('projects/:projectId/progress')
export class ProjectProgressController {
  constructor(private svc: ProjectProgressService) {}

  @Get()
  @ApiOperation({ summary: 'Ambil riwayat progress proyek' })
  @ApiOkResponse({ description: 'Riwayat progress proyek berhasil diambil.' })
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiNotFoundResponse(NotFoundResponse)
  findAll(@Param('projectId', ParseUUIDPipe) projectId: string) {
    return this.svc.findAll(projectId);
  }

  @Post()
  @Roles('PROJECT_MANAGER', 'PRODUKSI', 'DIREKTUR')
  @ApiOperation({ summary: 'Tambah catatan progress proyek' })
  @ApiCreatedResponse({ description: 'Progress proyek berhasil ditambahkan.' })
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiNotFoundResponse(NotFoundResponse)
  create(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Body() dto: CreateProjectProgressDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.svc.create(projectId, user.id, dto);
  }

  @Patch(':progressId')
  @Roles('PROJECT_MANAGER', 'PRODUKSI', 'DIREKTUR')
  @ApiOperation({ summary: 'Update catatan progress proyek' })
  @ApiOkResponse({ description: 'Progress proyek berhasil diperbarui.' })
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiNotFoundResponse(NotFoundResponse)
  update(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('progressId', ParseUUIDPipe) progressId: string,
    @Body() dto: UpdateProjectProgressDto,
  ) {
    return this.svc.update(projectId, progressId, dto);
  }

  @Delete(':progressId')
  @Roles('PROJECT_MANAGER', 'DIREKTUR')
  @ApiOperation({ summary: 'Hapus catatan progress proyek' })
  @ApiOkResponse({ description: 'Progress proyek berhasil dihapus.' })
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiNotFoundResponse(NotFoundResponse)
  remove(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('progressId', ParseUUIDPipe) progressId: string,
  ) {
    return this.svc.remove(projectId, progressId);
  }
}
