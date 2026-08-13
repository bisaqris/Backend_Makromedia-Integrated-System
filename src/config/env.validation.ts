import { Logger } from '@nestjs/common';

/**
 * Validasi environment variable saat bootstrap (fail-fast).
 * Dijalankan oleh ConfigModule.forRoot({ validate }). Bila konfigurasi wajib
 * hilang / tidak aman, aplikasi menolak start agar tidak berjalan dengan
 * setting berbahaya (mis. JWT secret placeholder).
 */
const PLACEHOLDER_SECRET = /(ganti|change[-_]?me|dev-secret|your-?secret|example|placeholder|secret123)/i;

export function validateEnv(config: Record<string, unknown>): Record<string, unknown> {
  const logger = new Logger('EnvValidation');
  const isProd = String(config.NODE_ENV ?? 'development') === 'production';
  const errors: string[] = [];

  const databaseUrl = String(config.DATABASE_URL ?? '').trim();
  if (!databaseUrl) errors.push('DATABASE_URL wajib diisi.');

  const jwtSecret = String(config.JWT_SECRET ?? '').trim();
  if (!jwtSecret) {
    errors.push('JWT_SECRET wajib diisi.');
  } else if (jwtSecret.length < 16) {
    errors.push('JWT_SECRET terlalu pendek (min. 16 karakter).');
  } else if (PLACEHOLDER_SECRET.test(jwtSecret)) {
    const msg = 'JWT_SECRET masih memakai nilai contoh/placeholder — ganti dengan string acak yang kuat.';
    // Placeholder di production = fatal; di dev cukup peringatan agar DX lancar.
    if (isProd) errors.push(msg);
    else logger.warn(msg);
  }

  const port = config.PORT;
  if (port !== undefined && Number.isNaN(Number(port))) {
    errors.push('PORT harus berupa angka.');
  }

  if (errors.length > 0) {
    logger.error('Konfigurasi environment tidak valid:\n  - ' + errors.join('\n  - '));
    throw new Error('Environment validation failed. Perbaiki .env sebelum menjalankan aplikasi.');
  }

  return config;
}
