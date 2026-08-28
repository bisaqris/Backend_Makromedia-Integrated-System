import { ApiProperty, ApiResponseOptions, getSchemaPath } from '@nestjs/swagger';
import {
  ReferenceObject,
  SchemaObject,
} from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';

// ---------------------------------------------------------------------------
// Success Envelope
// Shape dari TransformInterceptor:
//   { statusCode: number, message: string, data: T }
// ---------------------------------------------------------------------------

/**
 * Base class yang diregister sebagai Swagger model agar bisa dijadikan $ref.
 * Tidak dipakai langsung — gunakan helper `apiSuccessResponse()` di bawah.
 */
export class SuccessEnvelopeDto {
  /**
   * HTTP status code
   * @example 200
   */
  @ApiProperty({ example: 200 })
  statusCode: number;

  /**
   * Pesan response
   * @example Success
   */
  @ApiProperty({ example: 'Success' })
  message: string;

  /** Payload data */
  @ApiProperty({ nullable: true })
  data: unknown;
}

/**
 * Helper untuk @ApiOkResponse / @ApiCreatedResponse dengan generic data schema.
 *
 * Contoh penggunaan:
 * ```ts
 * @ApiExtraModels(SuccessEnvelopeDto, LoginResponseDto)
 * @ApiOkResponse(apiSuccessResponse({ $ref: getSchemaPath(LoginResponseDto) }))
 * ```
 */
export function apiSuccessResponse(
  dataSchema: ReferenceObject | SchemaObject,
  description = 'Success',
): ApiResponseOptions {
  return {
    description,
    schema: {
      allOf: [
        { $ref: getSchemaPath(SuccessEnvelopeDto) },
        {
          properties: {
            data: dataSchema,
          },
        },
      ],
    },
  };
}

/**
 * Helper untuk response berupa array.
 *
 * Contoh penggunaan:
 * ```ts
 * @ApiOkResponse(apiSuccessArrayResponse({ $ref: getSchemaPath(UserDto) }))
 * ```
 */
export function apiSuccessArrayResponse(
  itemSchema: ReferenceObject | SchemaObject,
  description = 'Success',
): ApiResponseOptions {
  return {
    description,
    schema: {
      allOf: [
        { $ref: getSchemaPath(SuccessEnvelopeDto) },
        {
          properties: {
            data: {
              type: 'array',
              items: itemSchema,
            },
          },
        },
      ],
    },
  };
}

// ---------------------------------------------------------------------------
// HTTP Error Schema
// Shape dari HttpExceptionFilter:
//   { statusCode, message (string | string[]), timestamp, path }
// ---------------------------------------------------------------------------
export const HttpErrorSchema: SchemaObject = {
  type: 'object',
  properties: {
    statusCode: { type: 'number', example: 400 },
    message: {
      oneOf: [
        { type: 'string', example: 'Pesan error.' },
        {
          type: 'array',
          items: { type: 'string' },
          example: ['email must be an email', 'password must be longer than 6 characters'],
        },
      ],
    },
    timestamp: { type: 'string', format: 'date-time', example: '2024-01-01T00:00:00.000Z' },
    path: { type: 'string', example: '/api/auth/login' },
  },
};

// ---------------------------------------------------------------------------
// Prisma Error Schema
// Shape dari PrismaExceptionFilter:
//   { statusCode, errorCode, message, timestamp, path }
// ---------------------------------------------------------------------------
export const PrismaErrorSchema: SchemaObject = {
  type: 'object',
  properties: {
    statusCode: { type: 'number', example: 409 },
    errorCode: { type: 'string', example: 'P2002' },
    message: { type: 'string', example: 'Data dengan nilai unik tersebut sudah terdaftar di database.' },
    timestamp: { type: 'string', format: 'date-time', example: '2024-01-01T00:00:00.000Z' },
    path: { type: 'string', example: '/api/users' },
  },
};

// ---------------------------------------------------------------------------
// Shorthand @ApiResponse options untuk status umum
// ---------------------------------------------------------------------------
export const UnauthorizedResponse: ApiResponseOptions = {
  description: 'Token tidak valid atau tidak disertakan.',
  schema: HttpErrorSchema,
};

export const ForbiddenResponse: ApiResponseOptions = {
  description: 'Anda tidak memiliki hak akses untuk resource ini.',
  schema: HttpErrorSchema,
};

export const NotFoundResponse: ApiResponseOptions = {
  description: 'Data yang diminta tidak ditemukan.',
  schema: HttpErrorSchema,
};

export const BadRequestResponse: ApiResponseOptions = {
  description: 'Request tidak valid (validasi gagal).',
  schema: HttpErrorSchema,
};

export const ConflictResponse: ApiResponseOptions = {
  description: 'Data sudah terdaftar (unique constraint).',
  schema: PrismaErrorSchema,
};
