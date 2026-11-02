import { Module } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { ProjectLinksService } from './project-links.service';
import { ProjectLinksController } from './project-links.controller';
import { ProjectProgressService } from './project-progress.service';
import { ProjectProgressController } from './project-progress.controller';

@Module({
  controllers: [ProjectsController, ProjectLinksController, ProjectProgressController],
  providers: [ProjectsService, ProjectLinksService, ProjectProgressService],
})
export class ProjectsModule {}
