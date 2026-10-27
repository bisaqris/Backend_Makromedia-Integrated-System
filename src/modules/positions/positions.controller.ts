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
import { PositionsService } from './positions.service';
import { CreatePositionDto, UpdatePositionDto } from './dto/position.dto';

@ApiTags('positions')
@ApiBearerAuth()
@Controller('positions')
export class PositionsController {
  constructor(private svc: PositionsService) {}

  @Get()
  @ApiOperation({ summary: 'Ambil daftar posisi/jabatan' })
  @ApiOkResponse({ description: 'Daftar posisi/jabatan berhasil diambil.' })
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  findAll() {
    return this.svc.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Ambil detail posisi/jabatan berdasarkan ID' })
  @ApiOkResponse({ description: 'Detail posisi/jabatan berhasil diambil.' })
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiNotFoundResponse(NotFoundResponse)
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.svc.findOne(id);
  }

  @Post()
  @Roles('DIREKTUR')
  @ApiOperation({ summary: 'Tambah posisi/jabatan baru (DIREKTUR)' })
  @ApiCreatedResponse({ description: 'Posisi/jabatan berhasil dibuat.' })
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  create(@Body() dto: CreatePositionDto) {
    return this.svc.create(dto);
  }

  @Patch(':id')
  @Roles('DIREKTUR')
  @ApiOperation({ summary: 'Update posisi/jabatan (DIREKTUR)' })
  @ApiOkResponse({ description: 'Posisi/jabatan berhasil diperbarui.' })
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiNotFoundResponse(NotFoundResponse)
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdatePositionDto) {
    return this.svc.update(id, dto);
  }

  @Delete(':id')
  @Roles('DIREKTUR')
  @ApiOperation({ summary: 'Hapus posisi/jabatan (DIREKTUR)' })
  @ApiOkResponse({ description: 'Posisi/jabatan berhasil dihapus.' })
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiNotFoundResponse(NotFoundResponse)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.svc.remove(id);
  }
}
