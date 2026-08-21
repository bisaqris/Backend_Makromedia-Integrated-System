import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, AuthUser } from '../../common/decorators/current-user.decorator';
import { TasksService } from './tasks.service';
import { CreateTaskDto, UpdateTaskDto, UpdateTaskProgressDto } from './dto/task.dto';

@ApiTags('tasks')
@ApiBearerAuth()
@Controller()
export class TasksController {
  constructor(private tasks: TasksService) {}

  @Get('projects/:projectId/tasks')
  byProject(@Param('projectId', ParseUUIDPipe) projectId: string) {
    return this.tasks.findByProject(projectId);
  }

  @Post('projects/:projectId/tasks')
  @Roles('PROJECT_MANAGER', 'FINANCE', 'DIREKTUR')
  create(@Param('projectId', ParseUUIDPipe) projectId: string, @Body() dto: CreateTaskDto) {
    return this.tasks.create(projectId, dto);
  }

  @Patch('tasks/:id')
  @Roles('PROJECT_MANAGER', 'FINANCE', 'DIREKTUR')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateTaskDto) {
    return this.tasks.update(id, dto);
  }

  @Patch('tasks/:id/progress')
  @Roles('PROJECT_MANAGER', 'PRODUKSI', 'DIREKTUR')
  updateProgress(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTaskProgressDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.tasks.updateProgress(id, dto.progress, user);
  }

  @Delete('tasks/:id')
  @Roles('PROJECT_MANAGER', 'FINANCE', 'DIREKTUR')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.tasks.remove(id);
  }
}
