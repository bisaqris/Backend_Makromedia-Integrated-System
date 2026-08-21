import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { ProjectAccessService } from '../../common/services/project-access.service';

@Module({
  controllers: [TasksController],
  providers: [TasksService, ProjectAccessService],
})
export class TasksModule {}
