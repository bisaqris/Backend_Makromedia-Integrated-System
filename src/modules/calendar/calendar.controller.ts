import { Controller, Get } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
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
  @ApiOperation({ summary: 'Ambil daftar event kalender sesuai role user' })
  @ApiOkResponse({ description: 'Daftar event kalender berhasil diambil.' })
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  events(@CurrentUser() user: AuthUser) { return this.svc.getEvents(user); }
}
