import { Module } from '@nestjs/common';
import { ProductionCostsService } from './production-costs.service';
import { ProductionCostsController } from './production-costs.controller';

@Module({ controllers: [ProductionCostsController], providers: [ProductionCostsService] })
export class ProductionCostsModule {}
