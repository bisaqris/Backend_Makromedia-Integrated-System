import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Request, Response } from 'express';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(PrismaExceptionFilter.name);

  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Terjadi kesalahan pada transaksi database.';

    switch (exception.code) {
      case 'P2002': {
        status = HttpStatus.CONFLICT;
        const target = (exception.meta?.target as string[]) || [];
        const fieldStr = target.length > 0 ? ` [${target.join(', ')}]` : '';
        message = `Data dengan nilai unik tersebut sudah terdaftar di database${fieldStr}.`;
        break;
      }
      case 'P2025': {
        status = HttpStatus.NOT_FOUND;
        message = 'Data yang diminta tidak ditemukan di database.';
        break;
      }
      case 'P2003': {
        status = HttpStatus.BAD_REQUEST;
        message = 'Gagal memproses data karena keterikatan relasi data (Foreign Key violation).';
        break;
      }
      case 'P2014': {
        status = HttpStatus.BAD_REQUEST;
        message = 'Perubahan yang diminta melanggar relasi data wajib.';
        break;
      }
      default:
        this.logger.error(
          `Prisma Unhandled Error [${exception.code}]: ${exception.message}`,
          exception.stack,
        );
        break;
    }

    this.logger.warn(
      `Prisma Error [${exception.code}] on ${request.method} ${request.url}: ${message}`,
    );

    response.status(status).json({
      statusCode: status,
      errorCode: exception.code,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}