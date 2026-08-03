import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { CrewService } from './crew.service';
import { UpsertCrewDto } from './dto/crew.dto';

@ApiTags('crew')
@ApiBearerAuth()
@Controller('crew')
export class CrewController {
  constructor(private svc: CrewService) {}

  @Get()
  findAll() {
    return this.svc.findAll();
  }

  @Post()
  @Roles('PROJECT_MANAGER', 'FINANCE', 'DIREKTUR')
  create(@Body() dto: UpsertCrewDto) {
    return this.svc.create(dto);
  }

  @Patch(':id')
  @Roles('PROJECT_MANAGER', 'FINANCE', 'DIREKTUR')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpsertCrewDto) {
    return this.svc.update(id, dto);
  }

  @Delete(':id')
  @Roles('DIREKTUR', 'FINANCE')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.svc.remove(id);
  }
}
