import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { ClientsService } from './clients.service';
import { UpsertClientDto } from './dto/client.dto';

@ApiTags('clients')
@ApiBearerAuth()
@Controller('clients')
export class ClientsController {
  constructor(private svc: ClientsService) {}
  @Get() findAll() { return this.svc.findAll(); }
  @Post() @Roles('SALES', 'FINANCE', 'DIREKTUR') create(@Body() dto: UpsertClientDto) { return this.svc.create(dto); }
  @Patch(':id') @Roles('SALES', 'FINANCE', 'DIREKTUR') update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpsertClientDto) { return this.svc.update(id, dto); }
  @Delete(':id') @Roles('DIREKTUR', 'FINANCE') remove(@Param('id', ParseUUIDPipe) id: string) { return this.svc.remove(id); }
}
