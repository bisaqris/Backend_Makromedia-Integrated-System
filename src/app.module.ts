import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';

import configuration from './config/configuration';
import { validateEnv } from './config/env.validation';
import { PrismaModule } from './prisma/prisma.module';
import { HealthModule } from './health/health.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { PrismaExceptionFilter } from './common/filters/prisma-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CompanyClientsModule } from './modules/company-clients/company-clients.module';
import { ClientsModule } from './modules/clients/clients.module';
import { CrewModule } from './modules/crew/crew.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { QuotationsModule } from './modules/quotations/quotations.module';
import { InvoicesModule } from './modules/invoices/invoices.module';
import { ProductionCostsModule } from './modules/production-costs/production-costs.module';
import { CalendarModule } from './modules/calendar/calendar.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration], validate: validateEnv }),
    PrismaModule,
    HealthModule,
    AuthModule,
    UsersModule,
    CompanyClientsModule,
    ClientsModule,
    CrewModule,
    ProjectsModule,
    QuotationsModule,
    InvoicesModule,
    ProductionCostsModule,
    CalendarModule,
  ],
  providers: [
    // 1. Interceptors: Log request latency & format response data
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
    { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },

    // 2. Guards: Autentikasi (JWT) dulu, baru otorisasi (RBAC)
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },

    // 3. Filters: Tangkap HTTP error & Prisma database error
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
    { provide: APP_FILTER, useClass: PrismaExceptionFilter },
  ],
})
export class AppModule {}
