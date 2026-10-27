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
import { CompanyClientsService } from './company-clients.service';
import { UpsertCompanyClientDto } from './dto/company-client.dto';

@ApiTags('company-clients')
@ApiBearerAuth()
@Controller('company-clients')
export class CompanyClientsController {
  constructor(private svc: CompanyClientsService) {}

  @Get()
  @ApiOperation({ summary: 'Ambil daftar semua perusahaan client' })
  @ApiOkResponse({ description: 'Daftar perusahaan client berhasil diambil.' })
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  findAll() { return this.svc.findAll(); }

  @Post()
  @Roles('SALES', 'FINANCE', 'DIREKTUR')
  @ApiOperation({ summary: 'Tambah perusahaan client baru' })
  @ApiCreatedResponse({ description: 'Perusahaan client berhasil ditambahkan.' })
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  create(@Body() dto: UpsertCompanyClientDto) { return this.svc.create(dto); }

  @Patch(':id')
  @Roles('SALES', 'FINANCE', 'DIREKTUR')
  @ApiOperation({ summary: 'Update data perusahaan client' })
  @ApiOkResponse({ description: 'Perusahaan client berhasil diperbarui.' })
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiNotFoundResponse(NotFoundResponse)
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpsertCompanyClientDto) { return this.svc.update(id, dto); }

  @Delete(':id')
  @Roles('DIREKTUR', 'FINANCE')
  @ApiOperation({ summary: 'Hapus perusahaan client' })
  @ApiOkResponse({ description: 'Perusahaan client berhasil dihapus.' })
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiNotFoundResponse(NotFoundResponse)
  remove(@Param('id', ParseUUIDPipe) id: string) { return this.svc.remove(id); }
}

