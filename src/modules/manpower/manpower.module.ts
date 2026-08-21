import { Module } from '@nestjs/common';
import { ManpowerService } from './manpower.service';
import { ManpowerController } from './manpower.controller';

@Module({
  controllers: [ManpowerController],
  providers: [ManpowerService],
})
export class ManpowerModule {}
