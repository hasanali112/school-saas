import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import type { Server } from 'node:http';
import request from 'supertest';
import { ApiResponse } from '@common/types/api-response';
import { Role } from '@module/auth/domain/role';
import { DataSource } from 'typeorm';
import { fakeDataSource } from '@test/utils/fake-data-source';
import { HolidaysRepository } from '@module/academics/application/ports/holidays.repository.port';
import { SessionsRepository } from '@module/academics/application/ports/sessions.repository.port';
import { SubjectsRepository } from '@module/academics/application/ports/subjects.repository.port';
import { TeachersRepository } from '@module/academics/application/ports/teachers.repository.port';
import {
  ClassSubjectRole,
  SubjectKind,
} from '@module/academics/domain/subject';
import { createMock } from '@test/utils/create-mock';
import { AppModule } from '../src/app.module';
import { setupApp } from '../src/app.setup';

const INSTITUTION_ID = '11111111-1111-4111-8111-111111111111';
const SECTION_ID = '44444444-4444-4444-8444-444444444444';
const SESSION_ID = '55555555-5555-4555-8555-555555555555';
const TEACHER_ID = '66666666-6666-4666-8666-666666666666';
const SUBJECT_ID = '77777777-7777-4777-8777-777777777777';

describe('Institution setup (e2e)', () => {
  let app: INestApplication;
  let adminToken: string;
  let teacherToken: string;
  const api = () => request(app.getHttpServer() as Server);
  const body = <T>(res: request.Response): ApiResponse<T> =>
    res.body as ApiResponse<T>;
  const subjects = createMock<SubjectsRepository>();
  const teachers = createMock<TeachersRepository>();
  const sessions = createMock<SessionsRepository>();
  const holidays = createMock<HolidaysRepository>();

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(SubjectsRepository)
      .useValue(subjects)
      .overrideProvider(TeachersRepository)
      .useValue(teachers)
      .overrideProvider(SessionsRepository)
      .useValue(sessions)
      .overrideProvider(HolidaysRepository)
      .useValue(holidays)
      .overrideProvider(DataSource)
      .useValue(fakeDataSource())
      .compile();
    app = setupApp(moduleRef.createNestApplication());
    await app.init();
    const jwt = app.get(JwtService);
    adminToken = jwt.sign({
      sub: 'admin',
      institutionId: INSTITUTION_ID,
      roles: [Role.AdminOfficer],
    });
    teacherToken = jwt.sign({
      sub: TEACHER_ID,
      institutionId: INSTITUTION_ID,
      roles: [Role.SubjectTeacher],
    });
  });

  afterAll(() => app.close());
  beforeEach(() => jest.clearAllMocks());

  it('POST /api/academics/subjects validates code and rejects religion on a general subject', async () => {
    await api()
      .post('/api/academics/subjects')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ code: 'bad code!', nameBn: 'x', nameEn: 'x' })
      .expect(400);
    const res = await api()
      .post('/api/academics/subjects')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ code: '109', nameBn: 'x', nameEn: 'x', religion: 'islam' })
      .expect(400);
    expect(body(res).error?.message).toContain('religion');
    expect(subjects.insert).not.toHaveBeenCalled();
  });

  it('GET /api/academics/classes/:id/subjects nests the subject under the mapping', async () => {
    subjects.findByClass.mockResolvedValue([
      {
        link: {
          id: 'l1',
          institutionId: INSTITUTION_ID,
          classId: SECTION_ID,
          subjectId: SUBJECT_ID,
          role: ClassSubjectRole.Compulsory,
          createdAt: new Date(),
        },
        subject: {
          id: SUBJECT_ID,
          institutionId: INSTITUTION_ID,
          code: '109',
          nameBn: 'গণিত',
          nameEn: 'Mathematics',
          kind: SubjectKind.General,
          religion: null,
          createdAt: new Date(),
        },
      },
    ]);
    const res = await api()
      .get(`/api/academics/classes/${SECTION_ID}/subjects`)
      .set('Authorization', `Bearer ${teacherToken}`)
      .expect(200);
    const { data } =
      body<Array<{ role: string; subject: { code: string } }>>(res);
    expect(data?.[0]).toMatchObject({
      role: 'compulsory',
      subject: { code: '109' },
    });
    expect(JSON.stringify(data)).not.toContain('institutionId');
  });

  it('teachers cannot assign teachers; admins can, and the response is a DTO', async () => {
    const payload = {
      sessionId: SESSION_ID,
      subjectId: SUBJECT_ID,
      teacherUserId: TEACHER_ID,
    };
    await api()
      .post(`/api/academics/sections/${SECTION_ID}/teachers`)
      .set('Authorization', `Bearer ${teacherToken}`)
      .send(payload)
      .expect(403);

    teachers.findUserRoles.mockResolvedValue([Role.SubjectTeacher]);
    teachers.upsertAssignment.mockResolvedValue({
      id: 'a1',
      institutionId: INSTITUTION_ID,
      sectionId: SECTION_ID,
      ...payload,
      createdAt: new Date(),
    });
    const res = await api()
      .post(`/api/academics/sections/${SECTION_ID}/teachers`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send(payload)
      .expect(201);
    expect(body<{ id: string }>(res).data).toEqual({
      id: 'a1',
      sectionId: SECTION_ID,
      ...payload,
    });
  });

  it('GET /api/academics/teachers/me/assignments uses the caller id and current session', async () => {
    sessions.findCurrentId.mockResolvedValue(SESSION_ID);
    teachers.findForTeacher.mockResolvedValue({
      classTeacherOf: [],
      subjectAssignments: [],
    });
    const res = await api()
      .get('/api/academics/teachers/me/assignments')
      .set('Authorization', `Bearer ${teacherToken}`)
      .expect(200);
    expect(teachers.findForTeacher).toHaveBeenCalledWith(
      TEACHER_ID,
      SESSION_ID,
    );
    expect(body<{ sessionId: string }>(res).data?.sessionId).toBe(SESSION_ID);
  });

  it('holidays: list is open to teachers, create needs admin, delete returns 204', async () => {
    holidays.findBetween.mockResolvedValue([]);
    await api()
      .get('/api/academics/holidays?from=2026-12-01&to=2026-12-31')
      .set('Authorization', `Bearer ${teacherToken}`)
      .expect(200);
    expect(holidays.findBetween).toHaveBeenCalledWith(
      '2026-12-01',
      '2026-12-31',
    );

    await api()
      .post('/api/academics/holidays')
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({
        date: '2026-12-16',
        nameBn: 'বিজয় দিবস',
        nameEn: 'Victory Day',
        kind: 'government',
      })
      .expect(403);

    holidays.remove.mockResolvedValue(true);
    await api()
      .delete(`/api/academics/holidays/${SUBJECT_ID}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(204);
  });
});
