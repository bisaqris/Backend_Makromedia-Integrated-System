import { Module } from '@nestjs/common';
import { ManpowerService } from './manpower.service';
import { SkillsService } from './skills.service';
import { ManpowerController } from './manpower.controller';

@Module({
  controllers: [ManpowerController],
  providers: [ManpowerService, SkillsService],
})
export class ManpowerModule {}
