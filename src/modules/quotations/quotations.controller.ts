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
import { CurrentUser, AuthUser } from '../../common/decorators/current-user.decorator';
import {
  ForbiddenResponse,
  NotFoundResponse,
  UnauthorizedResponse,
} from '../../common/swagger/api-response.schema';
import { QuotationsService } from './quotations.service';
import { CreateQuotationDto } from './dto/quotation.dto';

@ApiTags('quotations')
@ApiBearerAuth()
@Controller('quotations')
export class QuotationsController {
  constructor(private svc: QuotationsService) {}

  @Get('project/:projectId')
  @ApiOperation({ summary: 'Ambil daftar quotation berdasarkan proyek' })
  @ApiOkResponse({ description: 'Daftar quotation berhasil diambil.' })
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiNotFoundResponse(NotFoundResponse)
  byProject(@Param('projectId', ParseUUIDPipe) id: string) { return this.svc.findByProject(id); }

  @Get(':id')
  @ApiOperation({ summary: 'Ambil detail quotation berdasarkan ID' })
  @ApiOkResponse({ description: 'Detail quotation berhasil diambil.' })
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiNotFoundResponse(NotFoundResponse)
  findOne(@Param('id', ParseUUIDPipe) id: string) { return this.svc.findOne(id); }

  @Post()
  @Roles('SALES', 'FINANCE', 'DIREKTUR')
  @ApiOperation({ summary: 'Buat quotation baru' })
  @ApiCreatedResponse({ description: 'Quotation berhasil dibuat.' })
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  create(@Body() dto: CreateQuotationDto, @CurrentUser() user: AuthUser) { return this.svc.create(dto, user); }
}

