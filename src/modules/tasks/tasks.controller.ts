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
import { TasksService } from './tasks.service';
import { CreateTaskDto, UpdateTaskDto, UpdateTaskProgressDto } from './dto/task.dto';

@ApiTags('tasks')
@ApiBearerAuth()
@Controller()
export class TasksController {
  constructor(private tasks: TasksService) {}

  @Get('projects/:projectId/tasks')
  @ApiOperation({ summary: 'Ambil daftar task pada suatu proyek (di-scope berdasarkan role)' })
  @ApiOkResponse({ description: 'Daftar task berhasil diambil.' })
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiNotFoundResponse(NotFoundResponse)
  byProject(@Param('projectId', ParseUUIDPipe) projectId: string, @CurrentUser() user: AuthUser) {
    return this.tasks.findByProject(projectId, user);
  }

  @Post('projects/:projectId/tasks')
  @Roles('PROJECT_MANAGER', 'FINANCE', 'DIREKTUR')
  @ApiOperation({ summary: 'Buat task baru pada suatu proyek' })
  @ApiCreatedResponse({ description: 'Task berhasil dibuat.' })
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiNotFoundResponse(NotFoundResponse)
  create(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Body() dto: CreateTaskDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.tasks.create(projectId, dto, user);
  }

  @Patch('tasks/:id')
  @Roles('PROJECT_MANAGER', 'FINANCE', 'DIREKTUR')
  @ApiOperation({ summary: 'Update data task' })
  @ApiOkResponse({ description: 'Task berhasil diperbarui.' })
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiNotFoundResponse(NotFoundResponse)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTaskDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.tasks.update(id, dto, user);
  }

  @Patch('tasks/:id/progress')
  @Roles('PROJECT_MANAGER', 'PRODUKSI', 'DIREKTUR')
  @ApiOperation({ summary: 'Update progres pengerjaan task (PM/PRODUKSI/DIREKTUR)' })
  @ApiOkResponse({ description: 'Progres task berhasil diperbarui.' })
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiNotFoundResponse(NotFoundResponse)
  updateProgress(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTaskProgressDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.tasks.updateProgress(id, dto.progress, user);
  }

  @Delete('tasks/:id')
  @Roles('PROJECT_MANAGER', 'FINANCE', 'DIREKTUR')
  @ApiOperation({ summary: 'Hapus task' })
  @ApiOkResponse({ description: 'Task berhasil dihapus.' })
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiNotFoundResponse(NotFoundResponse)
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: AuthUser) {
    return this.tasks.remove(id, user);
  }
}
