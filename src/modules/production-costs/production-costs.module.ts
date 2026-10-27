import { Module } from '@nestjs/common';
import { ProductionCostsService } from './production-costs.service';
import { ProductionCostsController } from './production-costs.controller';
import { ProjectAccessService } from '../../common/services/project-access.service';

@Module({
  controllers: [ProductionCostsController],
  providers: [ProductionCostsService, ProjectAccessService],
})
export class ProductionCostsModule {}
