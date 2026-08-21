import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { StatusInvoice } from '@prisma/client';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, AuthUser } from '../../common/decorators/current-user.decorator';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto } from './dto/invoice.dto';

@ApiTags('invoices')
@ApiBearerAuth()
@Controller('invoices')
export class InvoicesController {
  constructor(private svc: InvoicesService) {}
  @Get('project/:projectId') @Roles('SALES', 'FINANCE', 'DIREKTUR')
  byProject(@Param('projectId', ParseUUIDPipe) id: string) { return this.svc.findByProject(id); }
  @Get(':id') @Roles('SALES', 'FINANCE', 'DIREKTUR')
  findOne(@Param('id', ParseUUIDPipe) id: string) { return this.svc.findOne(id); }
  @Post() @Roles('FINANCE', 'DIREKTUR')
  create(@Body() dto: CreateInvoiceDto, @CurrentUser() user: AuthUser) { return this.svc.create(dto, user); }
  @Patch(':id/status') @Roles('FINANCE', 'DIREKTUR')
  status(@Param('id', ParseUUIDPipe) id: string, @Body('status') status: StatusInvoice) {
    return this.svc.updateStatus(id, status);
  }
}
