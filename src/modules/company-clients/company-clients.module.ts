import { Module } from '@nestjs/common';
import { CompanyClientsService } from './company-clients.service';
import { CompanyClientsController } from './company-clients.controller';
@Module({ controllers: [CompanyClientsController], providers: [CompanyClientsService] })
export class CompanyClientsModule {}
