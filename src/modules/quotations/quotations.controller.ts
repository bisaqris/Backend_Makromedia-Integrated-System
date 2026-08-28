import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
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
import { CreateQuotationDto, UpdateQuotationStatusDto } from './dto/quotation.dto';

@ApiTags('quotations')
@ApiBearerAuth()
@Controller('quotations')
export class QuotationsController {
  constructor(private svc: QuotationsService) {}
  @Get('project/:projectId')
  @Roles('SALES', 'FINANCE', 'DIREKTUR')
  @ApiOperation({ summary: 'Ambil daftar quotation berdasarkan proyek' })
  @ApiOkResponse({ description: 'Daftar quotation berhasil diambil.' })
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiNotFoundResponse(NotFoundResponse)
  byProject(@Param('projectId', ParseUUIDPipe) id: string) { return this.svc.findByProject(id); }

  @Get(':id')
  @Roles('SALES', 'FINANCE', 'DIREKTUR')
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

  @Patch(':id/status')
  @Roles('SALES', 'FINANCE', 'DIREKTUR')
  @ApiOperation({ summary: 'Update status quotation' })
  @ApiOkResponse({ description: 'Status quotation berhasil diperbarui.' })
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiNotFoundResponse(NotFoundResponse)
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateQuotationStatusDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.svc.updateStatus(id, dto.status, user);
  }
}

