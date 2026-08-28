import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import compression from 'compression';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);
  const isProd = config.get<string>('nodeEnv') === 'production';

  app.setGlobalPrefix('api');

  // Security & performance middleware.
  // CSP dimatikan di non-production agar Swagger UI tetap berjalan.
  app.use(helmet(isProd ? undefined : { contentSecurityPolicy: false }));
  app.use(compression());

  app.enableCors({
    origin: config.get<string[]>('cors.origins'),
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }),
  );

  // Graceful shutdown (menutup koneksi Prisma saat SIGTERM/SIGINT).
  app.enableShutdownHooks();

  // Swagger hanya di non-production (hindari expose skema API di prod).
  if (!isProd) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Makromedia Integrated System API')
      .setDescription('REST API — manajemen proyek CV. Makromedia Visual')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    SwaggerModule.setup('api/docs', app, SwaggerModule.createDocument(app, swaggerConfig));
  }

  const port = config.get<number>('port') ?? 4000;
  await app.listen(port);
  Logger.log(
    `🚀 API running on http://localhost:${port}/api${isProd ? '' : '  |  docs: /api/docs'}`,
    'Bootstrap',
  );
}
bootstrap();
