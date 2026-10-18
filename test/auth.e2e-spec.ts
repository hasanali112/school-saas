import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import type { Server } from 'node:http';
import request from 'supertest';
import { ScryptPasswordHasher } from '@module/auth/adapter/scrypt.password-hasher';
import { ApiResponse } from '@common/types/api-response';
import { Role } from '@module/auth/domain/role';
import { DataSource } from 'typeorm';
import { fakeDataSource } from '@test/utils/fake-data-source';
import { UserStatus } from '@module/users/domain/user';
import type { User } from '@module/users/domain/user';
import { AuthRepositoryPort } from '@module/auth/port/auth.repository.port';
import { OtpSenderPort } from '@module/auth/port/otp-sender.port';
import { createMock } from '@test/utils/create-mock';
import { AppModule } from '../src/app.module';
import { setupApp } from '../src/app.setup';

const INSTITUTION_ID = '11111111-1111-4111-8111-111111111111';
let adminUser: User;

describe('Auth (e2e)', () => {
  let app: INestApplication;
  const api = () => request(app.getHttpServer() as Server);
  const body = <T>(res: request.Response): ApiResponse<T> =>
    res.body as ApiResponse<T>;
  const repo = createMock<AuthRepositoryPort>();
  const sender = createMock<OtpSenderPort>();

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(AuthRepositoryPort)
      .useValue(repo)
      .overrideProvider(OtpSenderPort)
      .useValue(sender)
      .overrideProvider(DataSource)
      .useValue(fakeDataSource())
      .compile();
    app = setupApp(moduleRef.createNestApplication());
    await app.init();

    adminUser = {
      id: '33333333-3333-4333-8333-333333333333',
      institutionId: INSTITUTION_ID,
      phone: '01700000000',
      name: 'Head',
      passwordHash: await new ScryptPasswordHasher().hash('Admin@12345'),
      roles: [Role.InstituteHead],
      status: UserStatus.Active,
      createdAt: new Date(),
    };
  });

  afterAll(() => app.close());
  beforeEach(() => jest.clearAllMocks());

  it('POST /api/auth/login validates the phone format', async () => {
    const res = await api()
      .post('/api/auth/login')
      .send({ institutionSlug: 'demo', phone: '123', password: 'x' })
      .expect(400);
    expect(body(res).error?.code).toBe('VALIDATION_ERROR');
  });

  it('POST /api/auth/login returns 401 for a wrong password', async () => {
    repo.findLoginUser.mockResolvedValue(adminUser);
    const res = await api()
      .post('/api/auth/login')
      .send({
        institutionSlug: 'demo',
        phone: '01700000000',
        password: 'wrong',
      })
      .expect(401);
    expect(body(res).error?.message).toBe('Invalid credentials');
  });

  it('login → token → GET /api/auth/me round-trips through the middleware and guards', async () => {
    repo.findLoginUser.mockResolvedValue(adminUser);
    repo.findCurrentUser.mockResolvedValue(adminUser);

    const loginRes = await api()
      .post('/api/auth/login')
      .send({
        institutionSlug: 'demo',
        phone: '01700000000',
        password: 'Admin@12345',
      })
      .expect(200);
    const { data } = body<{ accessToken: string; user: { roles: Role[] } }>(
      loginRes,
    );
    expect(data?.user.roles).toEqual([Role.InstituteHead]);

    const meRes = await api()
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${data?.accessToken}`)
      .expect(200);
    expect(body<{ id: string }>(meRes).data?.id).toBe(adminUser.id);
    expect(meRes.text).not.toContain('passwordHash');
  });

  it('OTP request then verify issues a token', async () => {
    repo.findLoginUser.mockResolvedValue(adminUser);
    await api()
      .post('/api/auth/otp/request')
      .send({ institutionSlug: 'demo', phone: '01700000000' })
      .expect(200);

    const [, code] = sender.send.mock.calls[0];
    const [, hash] = repo.replaceOtp.mock.calls[0];
    repo.findActiveOtp.mockResolvedValue({
      id: 'otp',
      userId: adminUser.id,
      codeHash: hash,
      attempts: 0,
      expiresAt: new Date(Date.now() + 60_000),
      consumedAt: null,
      createdAt: new Date(),
    });
    repo.recordAttempt.mockResolvedValue(1);

    const res = await api()
      .post('/api/auth/otp/verify')
      .send({ institutionSlug: 'demo', phone: '01700000000', code })
      .expect(200);
    expect(body<{ accessToken: string }>(res).data?.accessToken).toBeTruthy();
    expect(repo.consumeOtp).toHaveBeenCalledWith('otp');
  });

  it('GET /api/auth/me with a tampered token is 401', async () => {
    await api()
      .get('/api/auth/me')
      .set('Authorization', 'Bearer not.a.token')
      .expect(401);
  });
});
