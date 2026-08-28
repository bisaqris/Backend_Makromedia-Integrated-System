import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Put } from '@nestjs/common';
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
import { ManpowerService } from './manpower.service';
import { SkillsService } from './skills.service';
import { UpsertManpowerDto } from './dto/manpower.dto';
import { CreateSkillDto, SetManpowerSkillsDto, UpdateSkillDto } from './dto/skill.dto';

@ApiTags('manpower')
@ApiBearerAuth()
@Controller('manpower')
export class ManpowerController {
  constructor(private svc: ManpowerService, private skills: SkillsService) {}

  @Get()
  @ApiOperation({ summary: 'Ambil daftar semua manpower / crew' })
  @ApiOkResponse({ description: 'Daftar manpower berhasil diambil.' })
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  findAll() {
    return this.svc.findAll();
  }

  // --- Skill master data ---
  @Get('skills')
  @ApiOperation({ summary: 'Ambil daftar skill' })
  @ApiOkResponse({ description: 'Daftar skill berhasil diambil.' })
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  listSkills() {
    return this.skills.findAll();
  }

  @Post('skills')
  @Roles('DIREKTUR')
  @ApiOperation({ summary: 'Tambah skill baru (DIREKTUR)' })
  @ApiCreatedResponse({ description: 'Skill berhasil dibuat.' })
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  createSkill(@Body() dto: CreateSkillDto) {
    return this.skills.create(dto);
  }

  @Patch('skills/:id')
  @Roles('DIREKTUR')
  @ApiOperation({ summary: 'Update data skill (DIREKTUR)' })
  @ApiOkResponse({ description: 'Skill berhasil diperbarui.' })
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiNotFoundResponse(NotFoundResponse)
  updateSkill(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateSkillDto) {
    return this.skills.update(id, dto);
  }

  @Delete('skills/:id')
  @Roles('DIREKTUR')
  @ApiOperation({ summary: 'Hapus skill (DIREKTUR)' })
  @ApiOkResponse({ description: 'Skill berhasil dihapus.' })
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiNotFoundResponse(NotFoundResponse)
  removeSkill(@Param('id', ParseUUIDPipe) id: string) {
    return this.skills.remove(id);
  }

  // --- Manpower ---
  @Get(':id')
  @ApiOperation({ summary: 'Ambil detail manpower berdasarkan ID' })
  @ApiOkResponse({ description: 'Detail manpower berhasil diambil.' })
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiNotFoundResponse(NotFoundResponse)
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.svc.findOne(id);
  }

  @Post()
  @Roles('PROJECT_MANAGER', 'FINANCE', 'DIREKTUR')
  @ApiOperation({ summary: 'Tambah data manpower baru' })
  @ApiCreatedResponse({ description: 'Manpower berhasil ditambahkan.' })
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  create(@Body() dto: UpsertManpowerDto) {
    return this.svc.create(dto);
  }

  @Put(':id/skills')
  @Roles('PROJECT_MANAGER', 'FINANCE', 'DIREKTUR')
  @ApiOperation({ summary: 'Set daftar skill untuk manpower' })
  @ApiOkResponse({ description: 'Skill manpower berhasil diset.' })
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiNotFoundResponse(NotFoundResponse)
  setSkills(@Param('id', ParseUUIDPipe) id: string, @Body() dto: SetManpowerSkillsDto) {
    return this.skills.setManpowerSkills(id, dto.skillIds);
  }

  @Patch(':id')
  @Roles('PROJECT_MANAGER', 'FINANCE', 'DIREKTUR')
  @ApiOperation({ summary: 'Update data manpower' })
  @ApiOkResponse({ description: 'Manpower berhasil diperbarui.' })
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiNotFoundResponse(NotFoundResponse)
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpsertManpowerDto) {
    return this.svc.update(id, dto);
  }

  @Delete(':id')
  @Roles('DIREKTUR', 'FINANCE')
  @ApiOperation({ summary: 'Hapus data manpower' })
  @ApiOkResponse({ description: 'Manpower berhasil dihapus.' })
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiNotFoundResponse(NotFoundResponse)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.svc.remove(id);
  }
}
