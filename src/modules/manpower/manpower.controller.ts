import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Put, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { ManpowerService } from './manpower.service';
import { SkillsService } from './skills.service';
import { UpsertManpowerDto } from './dto/manpower.dto';
import { CreateSkillDto, SetManpowerSkillsDto, UpdateSkillDto } from './dto/skill.dto';
import { QueryManpowerDto } from './dto/query-manpower.dto';

@ApiTags('manpower')
@ApiBearerAuth()
@Controller('manpower')
export class ManpowerController {
  constructor(private svc: ManpowerService, private skills: SkillsService) {}

  @Get()
  @ApiOperation({ summary: 'Ambil daftar manpower/crew dengan filter dan pagination' })
  @ApiOkResponse({ description: 'Daftar manpower berhasil diambil.' })
  findAll(@Query() query: QueryManpowerDto) {
    return this.svc.findAll(query);
  }

  // --- Skill master data --- (route literal 'skills' harus dideklarasikan sebelum ':id')
  @Get('skills')
  listSkills() {
    return this.skills.findAll();
  }

  @Post('skills')
  @Roles('DIREKTUR')
  createSkill(@Body() dto: CreateSkillDto) {
    return this.skills.create(dto);
  }

  @Patch('skills/:id')
  @Roles('DIREKTUR')
  updateSkill(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateSkillDto) {
    return this.skills.update(id, dto);
  }

  @Delete('skills/:id')
  @Roles('DIREKTUR')
  removeSkill(@Param('id', ParseUUIDPipe) id: string) {
    return this.skills.remove(id);
  }

  // --- Manpower ---
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.svc.findOne(id);
  }

  @Post()
  @Roles('PROJECT_MANAGER', 'FINANCE', 'DIREKTUR')
  create(@Body() dto: UpsertManpowerDto) {
    return this.svc.create(dto);
  }

  @Put(':id/skills')
  @Roles('PROJECT_MANAGER', 'FINANCE', 'DIREKTUR')
  setSkills(@Param('id', ParseUUIDPipe) id: string, @Body() dto: SetManpowerSkillsDto) {
    return this.skills.setManpowerSkills(id, dto.skillIds);
  }

  @Patch(':id')
  @Roles('PROJECT_MANAGER', 'FINANCE', 'DIREKTUR')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpsertManpowerDto) {
    return this.svc.update(id, dto);
  }

  @Delete(':id')
  @Roles('DIREKTUR', 'FINANCE')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.svc.remove(id);
  }
}
