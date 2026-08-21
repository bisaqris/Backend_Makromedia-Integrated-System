import { Body, Controller, Get, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/payment.dto';

@ApiTags('payments')
@ApiBearerAuth()
@Controller('projects/:projectId/payments')
export class PaymentsController {
  constructor(private payments: PaymentsService) {}

  @Get()
  byProject(@Param('projectId', ParseUUIDPipe) projectId: string) {
    return this.payments.findByProject(projectId);
  }

  @Post()
  @Roles('FINANCE', 'DIREKTUR')
  create(@Param('projectId', ParseUUIDPipe) projectId: string, @Body() dto: CreatePaymentDto) {
    return this.payments.create(projectId, dto);
  }
}
