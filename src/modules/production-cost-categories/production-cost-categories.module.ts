import { Module } from '@nestjs/common';
import { ProductionCostCategoriesService } from './production-cost-categories.service';
import { ProductionCostCategoriesController } from './production-cost-categories.controller';

@Module({
  controllers: [ProductionCostCategoriesController],
  providers: [ProductionCostCategoriesService],
  exports: [ProductionCostCategoriesService],
})
export class ProductionCostCategoriesModule {}
