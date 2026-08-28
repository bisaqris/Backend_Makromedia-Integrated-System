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
import { CrewService } from './crew.service';
import { UpsertCrewDto } from './dto/crew.dto';

@ApiTags('crew')
@ApiBearerAuth()
@Controller('crew')
export class CrewController {
  constructor(private svc: CrewService) {}

  @Get()
  @ApiOperation({ summary: 'Ambil daftar semua anggota crew' })
  @ApiOkResponse({ description: 'Daftar crew berhasil diambil.' })
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  findAll() {
    return this.svc.findAll();
  }

  @Post()
  @Roles('PROJECT_MANAGER', 'FINANCE', 'DIREKTUR')
  @ApiOperation({ summary: 'Tambah anggota crew baru' })
  @ApiCreatedResponse({ description: 'Crew berhasil ditambahkan.' })
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  create(@Body() dto: UpsertCrewDto) {
    return this.svc.create(dto);
  }

  @Patch(':id')
  @Roles('PROJECT_MANAGER', 'FINANCE', 'DIREKTUR')
  @ApiOperation({ summary: 'Update data anggota crew' })
  @ApiOkResponse({ description: 'Crew berhasil diperbarui.' })
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiNotFoundResponse(NotFoundResponse)
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpsertCrewDto) {
    return this.svc.update(id, dto);
  }

  @Delete(':id')
  @Roles('DIREKTUR', 'FINANCE')
  @ApiOperation({ summary: 'Hapus anggota crew' })
  @ApiOkResponse({ description: 'Crew berhasil dihapus.' })
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiNotFoundResponse(NotFoundResponse)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.svc.remove(id);
  }
}
