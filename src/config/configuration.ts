export default () => ({
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: parseInt(process.env.PORT ?? '4000', 10),
  jwt: {
    // Secret divalidasi & dijamin ada oleh validateEnv (tanpa default tidak aman).
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN ?? '1d',
  },
  cors: {
    // Daftar origin yang diizinkan (comma-separated), default ke frontend lokal.
    origins: (process.env.FRONTEND_URL ?? 'http://localhost:3000')
      .split(',')
      .map((o) => o.trim())
      .filter(Boolean),
  },
});
