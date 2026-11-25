import { Module } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { ProjectLinksService } from './project-links.service';
import { ProjectLinksController } from './project-links.controller';
import { ProjectProgressService } from './project-progress.service';
import { ProjectProgressController } from './project-progress.controller';
import { ProjectMembersService } from './project-members.service';
import { ProjectMembersController } from './project-members.controller';

@Module({
  controllers: [
    ProjectsController,
    ProjectLinksController,
    ProjectProgressController,
    ProjectMembersController,
  ],
  providers: [ProjectsService, ProjectLinksService, ProjectProgressService, ProjectMembersService],
})
export class ProjectsModule {}
