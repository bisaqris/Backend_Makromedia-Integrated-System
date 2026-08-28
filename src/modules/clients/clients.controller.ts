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
  ConflictResponse,
  ForbiddenResponse,
  NotFoundResponse,
  UnauthorizedResponse,
} from '../../common/swagger/api-response.schema';
import { ClientsService } from './clients.service';
import { UpsertClientDto } from './dto/client.dto';

@ApiTags('clients')
@ApiBearerAuth()
@Controller('clients')
export class ClientsController {
  constructor(private svc: ClientsService) {}

  @Get()
  @ApiOperation({ summary: 'Ambil daftar semua client' })
  @ApiOkResponse({ description: 'Daftar client berhasil diambil.' })
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  findAll() { return this.svc.findAll(); }

  @Post()
  @Roles('SALES', 'FINANCE', 'DIREKTUR')
  @ApiOperation({ summary: 'Tambah client baru' })
  @ApiCreatedResponse({ description: 'Client berhasil ditambahkan.' })
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  create(@Body() dto: UpsertClientDto) { return this.svc.create(dto); }

  @Patch(':id')
  @Roles('SALES', 'FINANCE', 'DIREKTUR')
  @ApiOperation({ summary: 'Update data client' })
  @ApiOkResponse({ description: 'Client berhasil diperbarui.' })
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiNotFoundResponse(NotFoundResponse)
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpsertClientDto) { return this.svc.update(id, dto); }

  @Delete(':id')
  @Roles('DIREKTUR', 'FINANCE')
  @ApiOperation({ summary: 'Hapus client' })
  @ApiOkResponse({ description: 'Client berhasil dihapus.' })
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiNotFoundResponse(NotFoundResponse)
  remove(@Param('id', ParseUUIDPipe) id: string) { return this.svc.remove(id); }
}

