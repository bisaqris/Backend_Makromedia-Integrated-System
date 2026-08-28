import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { StatusInvoice } from '@prisma/client';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, AuthUser } from '../../common/decorators/current-user.decorator';
import {
  ForbiddenResponse,
  NotFoundResponse,
  UnauthorizedResponse,
} from '../../common/swagger/api-response.schema';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto } from './dto/invoice.dto';

@ApiTags('invoices')
@ApiBearerAuth()
@Controller('invoices')
export class InvoicesController {
  constructor(private svc: InvoicesService) {}

  @Get('project/:projectId')
  @ApiOperation({ summary: 'Ambil daftar invoice berdasarkan proyek' })
  @ApiOkResponse({ description: 'Daftar invoice berhasil diambil.' })
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiNotFoundResponse(NotFoundResponse)
  byProject(@Param('projectId', ParseUUIDPipe) id: string) { return this.svc.findByProject(id); }

  @Post()
  @Roles('FINANCE', 'DIREKTUR')
  @ApiOperation({ summary: 'Buat invoice baru' })
  @ApiCreatedResponse({ description: 'Invoice berhasil dibuat.' })
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  create(@Body() dto: CreateInvoiceDto, @CurrentUser() user: AuthUser) { return this.svc.create(dto, user); }

  @Patch(':id/status')
  @Roles('FINANCE', 'DIREKTUR')
  @ApiOperation({ summary: 'Update status invoice' })
  @ApiBody({ schema: { type: 'object', properties: { status: { type: 'string', enum: Object.values(StatusInvoice), example: 'PAID' } } } })
  @ApiOkResponse({ description: 'Status invoice berhasil diperbarui.' })
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiNotFoundResponse(NotFoundResponse)
  status(@Param('id', ParseUUIDPipe) id: string, @Body('status') status: StatusInvoice) {
    return this.svc.updateStatus(id, status);
  }
}

