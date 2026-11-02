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
import {
  ForbiddenResponse,
  NotFoundResponse,
  UnauthorizedResponse,
} from '../../common/swagger/api-response.schema';
import { ProjectLinksService } from './project-links.service';
import { CreateProjectLinkDto, UpdateProjectLinkDto } from './dto/project-link.dto';

@ApiTags('project-links')
@ApiBearerAuth()
@Controller('projects/:projectId/links')
export class ProjectLinksController {
  constructor(private svc: ProjectLinksService) {}

  @Get()
  @ApiOperation({ summary: 'Ambil daftar link pada proyek' })
  @ApiOkResponse({ description: 'Daftar link proyek berhasil diambil.' })
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiNotFoundResponse(NotFoundResponse)
  findAll(@Param('projectId', ParseUUIDPipe) projectId: string) {
    return this.svc.findAll(projectId);
  }

  @Post()
  @Roles('SALES', 'FINANCE', 'DIREKTUR', 'PROJECT_MANAGER')
  @ApiOperation({ summary: 'Tambah link pada proyek' })
  @ApiCreatedResponse({ description: 'Link proyek berhasil ditambahkan.' })
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiNotFoundResponse(NotFoundResponse)
  create(@Param('projectId', ParseUUIDPipe) projectId: string, @Body() dto: CreateProjectLinkDto) {
    return this.svc.create(projectId, dto);
  }

  @Patch(':linkId')
  @Roles('SALES', 'FINANCE', 'DIREKTUR', 'PROJECT_MANAGER')
  @ApiOperation({ summary: 'Update link proyek' })
  @ApiOkResponse({ description: 'Link proyek berhasil diperbarui.' })
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiNotFoundResponse(NotFoundResponse)
  update(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('linkId', ParseUUIDPipe) linkId: string,
    @Body() dto: UpdateProjectLinkDto,
  ) {
    return this.svc.update(projectId, linkId, dto);
  }

  @Delete(':linkId')
  @Roles('SALES', 'FINANCE', 'DIREKTUR', 'PROJECT_MANAGER')
  @ApiOperation({ summary: 'Hapus link proyek' })
  @ApiOkResponse({ description: 'Link proyek berhasil dihapus.' })
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiNotFoundResponse(NotFoundResponse)
  remove(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('linkId', ParseUUIDPipe) linkId: string,
  ) {
    return this.svc.remove(projectId, linkId);
  }
}
