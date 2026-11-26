import { Body, Controller, Get, Patch } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { ForbiddenResponse, UnauthorizedResponse } from '../../common/swagger/api-response.schema';
import { InvoiceSettingsService } from './invoice-settings.service';
import { UpdateInvoiceSettingDto } from './dto/invoice-setting.dto';

@ApiTags('invoice-settings')
@ApiBearerAuth()
@Controller('invoice-settings')
export class InvoiceSettingsController {
  constructor(private svc: InvoiceSettingsService) {}

  @Get()
  @Roles('SALES', 'FINANCE', 'DIREKTUR')
  @ApiOperation({ summary: 'Ambil pengaturan invoice global (T&C, PPh, rekening, penanda tangan)' })
  @ApiOkResponse({ description: 'Pengaturan invoice berhasil diambil.' })
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  get() {
    return this.svc.get();
  }

  @Patch()
  @Roles('DIREKTUR')
  @ApiOperation({ summary: 'Perbarui pengaturan invoice global (DIREKTUR)' })
  @ApiOkResponse({ description: 'Pengaturan invoice berhasil diperbarui.' })
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  update(@Body() dto: UpdateInvoiceSettingDto) {
    return this.svc.update(dto);
  }
}
