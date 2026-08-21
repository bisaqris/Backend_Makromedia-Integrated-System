import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, AuthUser } from '../../common/decorators/current-user.decorator';
import { QuotationsService } from './quotations.service';
import { CreateQuotationDto, UpdateQuotationStatusDto } from './dto/quotation.dto';

@ApiTags('quotations')
@ApiBearerAuth()
@Controller('quotations')
export class QuotationsController {
  constructor(private svc: QuotationsService) {}
  @Get('project/:projectId') byProject(@Param('projectId', ParseUUIDPipe) id: string) { return this.svc.findByProject(id); }
  @Get(':id') findOne(@Param('id', ParseUUIDPipe) id: string) { return this.svc.findOne(id); }
  @Post() @Roles('SALES', 'FINANCE', 'DIREKTUR')
  create(@Body() dto: CreateQuotationDto, @CurrentUser() user: AuthUser) { return this.svc.create(dto, user); }

  @Patch(':id/status') @Roles('SALES', 'FINANCE', 'DIREKTUR')
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateQuotationStatusDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.svc.updateStatus(id, dto.status, user);
  }
}
