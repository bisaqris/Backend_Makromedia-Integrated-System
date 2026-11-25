import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
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
import { ProjectMembersService } from './project-members.service';
import { AddProjectMemberDto } from './dto/project-member.dto';

@ApiTags('project-members')
@ApiBearerAuth()
@Controller('projects/:projectId/members')
export class ProjectMembersController {
  constructor(private svc: ProjectMembersService) {}

  @Get()
  @ApiOperation({ summary: 'Ambil daftar anggota (tim produksi) proyek' })
  @ApiOkResponse({ description: 'Daftar anggota proyek berhasil diambil.' })
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiNotFoundResponse(NotFoundResponse)
  list(@Param('projectId', ParseUUIDPipe) projectId: string) {
    return this.svc.list(projectId);
  }

  @Post()
  @Roles('DIREKTUR', 'FINANCE', 'SALES', 'PROJECT_MANAGER')
  @ApiOperation({ summary: 'Tambah anggota tim produksi ke proyek' })
  @ApiCreatedResponse({ description: 'Anggota proyek berhasil ditambahkan.' })
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiNotFoundResponse(NotFoundResponse)
  @ApiConflictResponse({ description: 'User sudah menjadi anggota proyek ini.' })
  add(@Param('projectId', ParseUUIDPipe) projectId: string, @Body() dto: AddProjectMemberDto) {
    return this.svc.add(projectId, dto.userId);
  }

  @Delete(':userId')
  @Roles('DIREKTUR', 'FINANCE', 'SALES', 'PROJECT_MANAGER')
  @ApiOperation({ summary: 'Keluarkan anggota dari proyek' })
  @ApiOkResponse({ description: 'Anggota proyek berhasil dikeluarkan.' })
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiNotFoundResponse(NotFoundResponse)
  remove(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('userId', ParseUUIDPipe) userId: string,
  ) {
    return this.svc.remove(projectId, userId);
  }
}
