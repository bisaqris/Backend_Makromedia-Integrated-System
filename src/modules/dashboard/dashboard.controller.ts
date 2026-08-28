import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, AuthUser } from '../../common/decorators/current-user.decorator';
import { DashboardService } from './dashboard.service';

@ApiTags('dashboard')
@ApiBearerAuth()
@Controller('dashboard')
export class DashboardController {
  constructor(private dashboard: DashboardService) {}

  @Get('summary')
  @Roles('DIREKTUR', 'FINANCE', 'SALES')
  summary() {
    return this.dashboard.summary();
  }

  @Get('project-counts')
  projectCounts(@CurrentUser() user: AuthUser) {
    return this.dashboard.projectCounts(user);
  }
}
