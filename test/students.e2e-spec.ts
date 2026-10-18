import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import type { Server } from 'node:http';
import request from 'supertest';
import { ApiResponse } from '@common/types/api-response';
import { Role } from '@module/auth/domain/role';
import { DataSource } from 'typeorm';
import { fakeDataSource } from '@test/utils/fake-data-source';
import { StudentsRepositoryPort } from '@module/students/port/students.repository.port';
import { StudentStatus } from '@module/students/domain/student';
import { createMock } from '@test/utils/create-mock';
import { AppModule } from '../src/app.module';
import { setupApp } from '../src/app.setup';

const INSTITUTION_ID = '11111111-1111-4111-8111-111111111111';
const STUDENT_ID = '22222222-2222-4222-8222-222222222222';

/**
 * HTTP-layer test: real middleware, guards, validation pipe, filter and
 * envelope; the repository is replaced so no database is needed.
 */
describe('Students (e2e)', () => {
  let app: INestApplication;
  let token: string;
  const api = () => request(app.getHttpServer() as Server);
  const body = <T>(res: request.Response): ApiResponse<T> =>
    res.body as ApiResponse<T>;
  const repo = createMock<StudentsRepositoryPort>();

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(StudentsRepositoryPort)
      .useValue(repo)
      .overrideProvider(DataSource)
      .useValue(fakeDataSource())
      .compile();

    app = setupApp(moduleRef.createNestApplication());
    await app.init();

    token = moduleRef.get(JwtService).sign({
      sub: 'u1',
      institutionId: INSTITUTION_ID,
      roles: [Role.AdminOfficer],
    });
  });

  afterAll(() => app.close());
  beforeEach(() => jest.clearAllMocks());

  it('GET /api/health is public and enveloped', async () => {
    const res = await api().get('/api/health').expect(200);
    expect(res.body).toEqual({
      success: true,
      data: { status: 'ok' },
      error: null,
    });
  });

  it('GET /api/students without a token returns 401 in the error envelope', async () => {
    const res = await api().get('/api/students').expect(401);
    const { success, error } = body(res);
    expect(success).toBe(false);
    expect(error?.code).toBe('UNAUTHORIZED');
  });

  it('GET /api/students with a role outside READ_ROLES returns 403', async () => {
    const guardianToken = app.get(JwtService).sign({
      sub: 'g1',
      institutionId: INSTITUTION_ID,
      roles: [Role.Guardian],
    });
    await api()
      .get('/api/students')
      .set('Authorization', `Bearer ${guardianToken}`)
      .expect(403);
  });

  it('POST /api/students rejects unknown and invalid fields with VALIDATION_ERROR', async () => {
    const res = await api()
      .post('/api/students')
      .set('Authorization', `Bearer ${token}`)
      .send({
        admissionNo: 'bad admission!',
        nameBn: '',
        nameEn: 'x',
        extra: 1,
      })
      .expect(400);
    const { error } = body(res);
    expect(error?.code).toBe('VALIDATION_ERROR');
    expect(error?.details).toEqual(
      expect.arrayContaining([expect.stringContaining('extra')]),
    );
    expect(repo.insert).not.toHaveBeenCalled();
  });

  it('POST /api/students creates and returns the response DTO', async () => {
    repo.insert.mockResolvedValue({
      id: STUDENT_ID,
      institutionId: INSTITUTION_ID,
      admissionNo: 'A-001',
      nameBn: 'রহিম',
      nameEn: 'Rahim',
      dateOfBirth: null,
      gender: null,
      bloodGroup: null,
      religion: null,
      birthCertificateNo: null,
      addressBn: null,
      addressEn: null,
      photoKey: null,
      status: StudentStatus.Active,
      exitedAt: null,
      exitReason: null,
      createdAt: new Date('2026-01-01'),
    });

    const res = await api()
      .post('/api/students')
      .set('Authorization', `Bearer ${token}`)
      .send({ admissionNo: 'A-001', nameBn: 'রহিম', nameEn: 'Rahim' })
      .expect(201);

    const { data } = body<Record<string, unknown>>(res);
    expect(data).toMatchObject({
      id: STUDENT_ID,
      admissionNo: 'A-001',
      nameEn: 'Rahim',
    });
    expect(data).not.toHaveProperty('institutionId');
    expect(repo.insert).toHaveBeenCalledWith(
      expect.objectContaining({ institutionId: INSTITUTION_ID }),
    );
  });

  it('GET /api/students paginates and lifts meta into the envelope', async () => {
    repo.findPage.mockResolvedValue({ rows: [], total: 0 });

    const res = await api()
      .get('/api/students?page=3&limit=5&search=Ra')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(repo.findPage).toHaveBeenCalledWith(10, 5, {
      search: 'Ra',
      status: undefined,
    });
    expect(body(res).meta).toEqual({ total: 0, page: 3, limit: 5 });
  });

  it('GET /api/students/:id validates the UUID', async () => {
    await api()
      .get('/api/students/not-a-uuid')
      .set('Authorization', `Bearer ${token}`)
      .expect(400);
  });
});
