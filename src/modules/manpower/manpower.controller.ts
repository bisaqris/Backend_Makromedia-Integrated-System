import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { ManpowerService } from './manpower.service';
import { UpsertManpowerDto } from './dto/manpower.dto';

@ApiTags('manpower')
@ApiBearerAuth()
@Controller('manpower')
export class ManpowerController {
  constructor(private svc: ManpowerService) {}

  @Get()
  findAll() {
    return this.svc.findAll();
  }

  @Post()
  @Roles('PROJECT_MANAGER', 'FINANCE', 'DIREKTUR')
  create(@Body() dto: UpsertManpowerDto) {
    return this.svc.create(dto);
  }

  @Patch(':id')
  @Roles('PROJECT_MANAGER', 'FINANCE', 'DIREKTUR')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpsertManpowerDto) {
    return this.svc.update(id, dto);
  }

  @Delete(':id')
  @Roles('DIREKTUR', 'FINANCE')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.svc.remove(id);
  }
}
