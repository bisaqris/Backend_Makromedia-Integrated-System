import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { CompanyClientsService } from './company-clients.service';
import { UpsertCompanyClientDto } from './dto/company-client.dto';

@ApiTags('company-clients')
@ApiBearerAuth()
@Controller('company-clients')
export class CompanyClientsController {
  constructor(private svc: CompanyClientsService) {}
  @Get() findAll() { return this.svc.findAll(); }
  @Post() @Roles('SALES', 'FINANCE', 'DIREKTUR') create(@Body() dto: UpsertCompanyClientDto) { return this.svc.create(dto); }
  @Patch(':id') @Roles('SALES', 'FINANCE', 'DIREKTUR') update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpsertCompanyClientDto) { return this.svc.update(id, dto); }
  @Delete(':id') @Roles('DIREKTUR', 'FINANCE') remove(@Param('id', ParseUUIDPipe) id: string) { return this.svc.remove(id); }
}
