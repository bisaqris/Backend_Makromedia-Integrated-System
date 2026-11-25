import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentUser, AuthUser } from '../../common/decorators/current-user.decorator';
import { UnauthorizedResponse } from '../../common/swagger/api-response.schema';
import { CalendarService } from './calendar.service';

@ApiTags('calendar')
@ApiBearerAuth()
@Controller('calendar')
export class CalendarController {
  constructor(private svc: CalendarService) {}

  @Get('events')
  @ApiOperation({ summary: 'Ambil event kalender sesuai role, difilter rentang tanggal (opsional)' })
  @ApiQuery({ name: 'start', required: false, description: 'Batas awal rentang (ISO 8601)' })
  @ApiQuery({ name: 'end', required: false, description: 'Batas akhir rentang (ISO 8601)' })
  @ApiOkResponse({ description: 'Daftar event kalender berhasil diambil.' })
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  events(
    @CurrentUser() user: AuthUser,
    @Query('start') start?: string,
    @Query('end') end?: string,
  ) {
    return this.svc.getEvents(user, start, end);
  }
}
