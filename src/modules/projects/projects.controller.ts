import {
  Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, AuthUser } from '../../common/decorators/current-user.decorator';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { QueryProjectDto } from './dto/query-project.dto';

@ApiTags('projects')
@ApiBearerAuth()
@Controller('projects')
export class ProjectsController {
  constructor(private projects: ProjectsService) {}

  @Get()
  @ApiOperation({ summary: 'Ambil daftar proyek dengan filter dan pagination' })
  @ApiOkResponse({ description: 'Daftar proyek berhasil diambil.' })
  findAll(@Query() query: QueryProjectDto, @CurrentUser() user: AuthUser) {
    return this.projects.findAll(query, user);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: AuthUser) {
    return this.projects.findOne(id, user);
  }

  // Add New Project — Sales, Finance, Direktur (SDD — UC01)
  @Post()
  @Roles('SALES', 'FINANCE', 'DIREKTUR')
  create(@Body() dto: CreateProjectDto, @CurrentUser() user: AuthUser) {
    return this.projects.create(dto, user);
  }

  @Patch(':id')
  @Roles('SALES', 'FINANCE', 'DIREKTUR', 'PROJECT_MANAGER')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateProjectDto) {
    return this.projects.update(id, dto);
  }

  @Delete(':id')
  @Roles('DIREKTUR', 'FINANCE')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.projects.remove(id);
  }
}
