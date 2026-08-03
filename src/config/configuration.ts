export default () => ({
  port: parseInt(process.env.PORT ?? '4000', 10),
  jwt: {
    secret: process.env.JWT_SECRET ?? 'dev-secret-change-me',
    expiresIn: process.env.JWT_EXPIRES_IN ?? '1d',
  },
});