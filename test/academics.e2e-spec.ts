import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import type { Server } from 'node:http';
import request from 'supertest';
import { ApiResponse } from '@common/types/api-response';
import { Role } from '@module/auth/domain/role';
import { DataSource } from 'typeorm';
import { fakeDataSource } from '@test/utils/fake-data-source';
import { ClassesRepositoryPort } from '@module/academics/port/classes.repository.port';
import { SessionsRepositoryPort } from '@module/academics/port/sessions.repository.port';
import { ShiftsRepositoryPort } from '@module/academics/port/shifts.repository.port';
import { createMock } from '@test/utils/create-mock';
import { AppModule } from '../src/app.module';
import { setupApp } from '../src/app.setup';

const INSTITUTION_ID = '11111111-1111-4111-8111-111111111111';
const CLASS_ID = '44444444-4444-4444-8444-444444444444';

describe('Academics (e2e)', () => {
  let app: INestApplication;
  let adminToken: string;
  let teacherToken: string;
  const api = () => request(app.getHttpServer() as Server);
  const body = <T>(res: request.Response): ApiResponse<T> =>
    res.body as ApiResponse<T>;
  const sessions = createMock<SessionsRepositoryPort>();
  const shifts = createMock<ShiftsRepositoryPort>();
  const classes = createMock<ClassesRepositoryPort>();

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(SessionsRepositoryPort)
      .useValue(sessions)
      .overrideProvider(ShiftsRepositoryPort)
      .useValue(shifts)
      .overrideProvider(ClassesRepositoryPort)
      .useValue(classes)
      .overrideProvider(DataSource)
      .useValue(fakeDataSource())
      .compile();
    app = setupApp(moduleRef.createNestApplication());
    await app.init();
    const jwt = app.get(JwtService);
    adminToken = jwt.sign({
      sub: 'u1',
      institutionId: INSTITUTION_ID,
      roles: [Role.AdminOfficer],
    });
    teacherToken = jwt.sign({
      sub: 'u2',
      institutionId: INSTITUTION_ID,
      roles: [Role.SubjectTeacher],
    });
  });

  afterAll(() => app.close());
  beforeEach(() => jest.clearAllMocks());

  it('teachers can read classes but not create them', async () => {
    classes.findAllWithSections.mockResolvedValue({
      classes: [],
      sections: [],
    });
    await api()
      .get('/api/academics/classes')
      .set('Authorization', `Bearer ${teacherToken}`)
      .expect(200);
    await api()
      .post('/api/academics/classes')
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({ name: 'Six', ordinal: 6 })
      .expect(403);
    expect(classes.insertClass).not.toHaveBeenCalled();
  });

  it('POST /api/academics/sessions validates dates and order', async () => {
    const res = await api()
      .post('/api/academics/sessions')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: '2027', startsOn: '2027-12-31', endsOn: '2027-01-01' })
      .expect(400);
    expect(body(res).error?.message).toBe('startsOn must be before endsOn');
    await api()
      .post('/api/academics/sessions')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: '2027', startsOn: 'yesterday', endsOn: '2027-01-01' })
      .expect(400);
  });

  it('GET /api/academics/classes nests sections under classes', async () => {
    classes.findAllWithSections.mockResolvedValue({
      classes: [
        {
          id: CLASS_ID,
          institutionId: INSTITUTION_ID,
          name: 'Six',
          ordinal: 6,
          createdAt: new Date(),
        },
      ],
      sections: [
        {
          id: 's1',
          institutionId: INSTITUTION_ID,
          classId: CLASS_ID,
          shiftId: null,
          name: 'A',
          createdAt: new Date(),
        },
      ],
    });
    const res = await api()
      .get('/api/academics/classes')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
    const { data } =
      body<Array<{ name: string; sections: Array<{ name: string }> }>>(res);
    expect(data?.[0].sections.map((s) => s.name)).toEqual(['A']);
    expect(data?.[0]).not.toHaveProperty('institutionId');
  });

  it('POST /api/academics/classes/:classId/sections validates the class id', async () => {
    await api()
      .post('/api/academics/classes/not-a-uuid/sections')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'A' })
      .expect(400);
  });

  it('POST /api/academics/sessions/:id/current returns the updated session', async () => {
    sessions.setCurrent.mockResolvedValue({
      id: CLASS_ID,
      institutionId: INSTITUTION_ID,
      name: '2027',
      startsOn: '2027-01-01',
      endsOn: '2027-12-31',
      isCurrent: true,
      createdAt: new Date(),
    });
    const res = await api()
      .post(`/api/academics/sessions/${CLASS_ID}/current`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
    expect(body<{ isCurrent: boolean }>(res).data?.isCurrent).toBe(true);
  });
});
