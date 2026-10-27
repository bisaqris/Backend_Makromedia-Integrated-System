import { Body, Controller, Get, Param, ParseUUIDPipe, Post } from '@nestjs/common';
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
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/payment.dto';

@ApiTags('payments')
@ApiBearerAuth()
@Controller('projects/:projectId/payments')
export class PaymentsController {
  constructor(private payments: PaymentsService) {}

  @Get()
  @Roles('SALES', 'FINANCE', 'DIREKTUR')
  @ApiOperation({ summary: 'Ambil daftar pembayaran pada suatu proyek' })
  @ApiOkResponse({ description: 'Daftar pembayaran berhasil diambil.' })
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiNotFoundResponse(NotFoundResponse)
  byProject(@Param('projectId', ParseUUIDPipe) projectId: string) {
    return this.payments.findByProject(projectId);
  }

  @Post()
  @Roles('FINANCE', 'DIREKTUR')
  @ApiOperation({ summary: 'Catat pembayaran baru untuk suatu proyek' })
  @ApiCreatedResponse({ description: 'Pembayaran berhasil dicatat.' })
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiNotFoundResponse(NotFoundResponse)
  create(@Param('projectId', ParseUUIDPipe) projectId: string, @Body() dto: CreatePaymentDto) {
    return this.payments.create(projectId, dto);
  }
}
