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
  // Identitas perusahaan penerbit (dipakai sebagai header pada preview quotation/invoice).
  company: {
    name: process.env.COMPANY_NAME ?? 'Makromedia',
    address: process.env.COMPANY_ADDRESS ?? 'Malang, Jawa Timur, Indonesia',
    phone: process.env.COMPANY_PHONE ?? '',
    email: process.env.COMPANY_EMAIL ?? '',
    website: process.env.COMPANY_WEBSITE ?? '',
    bankName: process.env.COMPANY_BANK_NAME ?? '',
    bankAccountNo: process.env.COMPANY_BANK_ACCOUNT_NO ?? '',
    bankAccountName: process.env.COMPANY_BANK_ACCOUNT_NAME ?? '',
  },
});
