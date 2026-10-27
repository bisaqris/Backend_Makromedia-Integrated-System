import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  statusCode: number;
  message: string;
  data: T;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse();

    return next.handle().pipe(
      map((data) => {
        // Jika response sudah terstruktur atau bertipe khusus (seperti objek health check), return langsung
        if (data && typeof data === 'object' && 'statusCode' in data && 'data' in data) {
          return data;
        }

        // Jika response merupakan hasil paginasi (mengandung 'data' dan 'meta'), pisahkan meta ke root level
        if (data && typeof data === 'object' && 'data' in data && 'meta' in data) {
          return {
            statusCode: response.statusCode || 200,
            message: 'Success',
            data: (data as any).data ?? null,
            meta: (data as any).meta,
          } as any;
        }

        return {
          statusCode: response.statusCode || 200,
          message: 'Success',
          data: data ?? null,
        };
      }),
    );
  }
}
