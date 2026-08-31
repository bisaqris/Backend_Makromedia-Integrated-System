import { Controller, Get } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, AuthUser } from '../../common/decorators/current-user.decorator';
import {
  ForbiddenResponse,
  UnauthorizedResponse,
} from '../../common/swagger/api-response.schema';
import { DashboardService } from './dashboard.service';

@ApiTags('dashboard')
@ApiBearerAuth()
@Controller('dashboard')
export class DashboardController {
  constructor(private dashboard: DashboardService) {}

  @Get('summary')
  @Roles('DIREKTUR', 'FINANCE', 'SALES')
  @ApiOperation({ summary: 'Ringkasan metrik bisnis untuk dashboard (DIREKTUR/FINANCE/SALES)' })
  @ApiOkResponse({ description: 'Ringkasan dashboard berhasil diambil.' })
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  summary() {
    return this.dashboard.summary();
  }

  @Get('project-counts')
  @ApiOperation({ summary: 'Jumlah proyek per status (di-scope berdasarkan role user)' })
  @ApiOkResponse({ description: 'Jumlah proyek per status berhasil diambil.' })
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  projectCounts(@CurrentUser() user: AuthUser) {
    return this.dashboard.projectCounts(user);
  }
}
