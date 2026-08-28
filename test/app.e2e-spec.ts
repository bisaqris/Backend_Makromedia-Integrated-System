import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';

/**
 * e2e RBAC & health. Membutuhkan database + seed (dijalankan di CI dengan service
 * postgres + `pnpm db:setup`). Akun demo dari seed: sales@makromedia.id / Password123!.
 */
describe('Auth & RBAC (e2e)', () => {
  let app: INestApplication;
  let salesToken: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/health -> 200 (public)', () =>
    request(app.getHttpServer()).get('/api/health').expect(200));

  it('POST /api/auth/login (sales) -> 200 + accessToken', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'sales@makromedia.id', password: 'Password123!' })
      .expect(200);
    salesToken = res.body.data.accessToken;
    expect(salesToken).toBeDefined();
  });

  it('GET /api/users tanpa token -> 401', () =>
    request(app.getHttpServer()).get('/api/users').expect(401));

  it('GET /api/users sebagai Sales -> 403 (khusus Direktur)', () =>
    request(app.getHttpServer())
      .get('/api/users')
      .set('Authorization', `Bearer ${salesToken}`)
      .expect(403));

  it('Produksi -> 403 saat mengakses endpoint finansial (RBAC)', async () => {
    const login = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'produksi@makromedia.id', password: 'Password123!' })
      .expect(200);
    const token = login.body.data.accessToken;
    const anyUuid = '00000000-0000-0000-0000-000000000000';
    await request(app.getHttpServer())
      .get(`/api/quotations/project/${anyUuid}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(403);
  });
});
