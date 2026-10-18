import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import type { Server } from 'node:http';
import request from 'supertest';
import { todayLocal } from '@shared/time/local-date';
import { ApiResponse } from '@common/types/api-response';
import { Role } from '@modules/auth/roles';
import { DatabaseService } from '@database/database.service';
import { AttendanceRecordRow, LeaveApplicationRow } from '@database/schema';
import { HolidaysRepository } from '@modules/academics/holidays/holidays.repository';
import { SessionsRepository } from '@modules/academics/sessions/sessions.repository';
import { AttendanceRepository } from '@modules/attendance/attendance.repository';
import { LeaveRepository } from '@modules/leave/leave.repository';
import { AuditRepository } from '@shared/audit/audit.repository';
import { createMock } from '@test/utils/create-mock';
import { AppModule } from '../src/app.module';
import { setupApp } from '../src/app.setup';

const INSTITUTION_ID = '11111111-1111-4111-8111-111111111111';
const SECTION_ID = '44444444-4444-4444-8444-444444444444';
const SESSION_ID = '55555555-5555-4555-8555-555555555555';
const ENROLMENT_ID = '66666666-6666-4666-8666-666666666666';
const TYPE_ID = '77777777-7777-4777-8777-777777777777';

describe('Attendance & leave (e2e)', () => {
  let app: INestApplication;
  let adminToken: string;
  let teacherToken: string;
  const api = () => request(app.getHttpServer() as Server);
  const body = <T>(res: request.Response): ApiResponse<T> =>
    res.body as ApiResponse<T>;
  const attendance = createMock<AttendanceRepository>();
  const leave = createMock<LeaveRepository>();
  const sessions = createMock<SessionsRepository>();
  const holidays = createMock<HolidaysRepository>();
  const audit = createMock<AuditRepository>();

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(AttendanceRepository)
      .useValue(attendance)
      .overrideProvider(LeaveRepository)
      .useValue(leave)
      .overrideProvider(SessionsRepository)
      .useValue(sessions)
      .overrideProvider(HolidaysRepository)
      .useValue(holidays)
      .overrideProvider(AuditRepository)
      .useValue(audit)
      .overrideProvider(DatabaseService)
      .useValue({})
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
      sub: 'teacher',
      institutionId: INSTITUTION_ID,
      roles: [Role.SubjectTeacher],
    });
  });

  afterAll(() => app.close());
  beforeEach(() => {
    jest.clearAllMocks();
    sessions.findCurrentId.mockResolvedValue(SESSION_ID);
    holidays.existsOn.mockResolvedValue(false);
    attendance.findAssignedSectionIds.mockResolvedValue(new Set([SECTION_ID]));
    attendance.findSheet.mockResolvedValue([
      {
        enrolmentId: ENROLMENT_ID,
        studentId: 'stu',
        rollNo: 1,
        nameBn: 'ক',
        nameEn: 'A',
        status: null,
      },
    ]);
    attendance.findStudentsOnApprovedLeave.mockResolvedValue(new Set());
    attendance.upsertMany.mockImplementation((rows) =>
      Promise.resolve(
        rows.map((r, i): AttendanceRecordRow => ({
          ...r,
          id: `r${i}`,
          period: r.period ?? 0,
          markedAt: new Date(),
          updatedBy: null,
          updatedAt: null,
        })),
      ),
    );
  });

  it('POST /api/attendance/sections/:id validates entries and status values', async () => {
    const res = await api()
      .post(`/api/attendance/sections/${SECTION_ID}`)
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({
        date: todayLocal(),
        entries: [{ enrolmentId: ENROLMENT_ID, status: 'here' }],
      })
      .expect(400);
    expect(body(res).error?.code).toBe('VALIDATION_ERROR');
  });

  it('a teacher marks today for an assigned section and gets counts back', async () => {
    const res = await api()
      .post(`/api/attendance/sections/${SECTION_ID}`)
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({
        date: todayLocal(),
        entries: [{ enrolmentId: ENROLMENT_ID, status: 'absent' }],
      })
      .expect(200);
    expect(
      body<{ counts: { absent: number }; backdated: boolean }>(res).data,
    ).toMatchObject({
      counts: { absent: 1 },
      backdated: false,
    });
  });

  it('a teacher cannot backdate; the office can with a reason, and it is audited', async () => {
    const past = {
      date: '2026-01-05',
      entries: [{ enrolmentId: ENROLMENT_ID, status: 'present' }],
    };
    await api()
      .post(`/api/attendance/sections/${SECTION_ID}`)
      .set('Authorization', `Bearer ${teacherToken}`)
      .send(past)
      .expect(403);
    await api()
      .post(`/api/attendance/sections/${SECTION_ID}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send(past)
      .expect(400);

    attendance.findExisting.mockResolvedValue([]);
    audit.insert.mockResolvedValue();
    await api()
      .post(`/api/attendance/sections/${SECTION_ID}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ ...past, reason: 'Paper register recovered' })
      .expect(200);
    expect(audit.insert).toHaveBeenCalledWith([
      expect.objectContaining({
        action: 'attendance.backdated',
        institutionId: INSTITUTION_ID,
      }),
    ]);
  });

  it('GET /api/attendance/sections/:id/summary?month= returns stipend flags', async () => {
    attendance.findMonth.mockResolvedValue([
      {
        id: 'a',
        institutionId: INSTITUTION_ID,
        sessionId: SESSION_ID,
        sectionId: SECTION_ID,
        enrolmentId: ENROLMENT_ID,
        studentId: 'stu',
        date: '2026-03-01',
        period: 0,
        status: 'present',
        markedBy: 'teacher',
        markedAt: new Date(),
        updatedBy: null,
        updatedAt: null,
      },
    ]);
    const res = await api()
      .get(`/api/attendance/sections/${SECTION_ID}/summary?month=2026-03`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
    expect(
      body<{ rows: Array<{ stipendEligible: boolean; percentage: number }> }>(
        res,
      ).data?.rows[0],
    ).toMatchObject({
      percentage: 100,
      stipendEligible: true,
    });
  });

  it('leave: teacher applies, cannot approve; head approves and the response carries the day count', async () => {
    leave.findTypeById.mockResolvedValue({
      id: TYPE_ID,
      institutionId: INSTITUTION_ID,
      name: 'Casual',
      appliesTo: 'staff',
      maxDaysPerYear: null,
      createdAt: new Date(),
    });
    leave.insertApplication.mockImplementation(
      (data): Promise<LeaveApplicationRow> =>
        Promise.resolve({
          ...data,
          id: 'app',
          userId: data.userId ?? null,
          studentId: data.studentId ?? null,
          status: 'pending',
          decidedBy: null,
          decidedAt: null,
          decisionNote: null,
          createdAt: new Date(),
        }),
    );
    const applied = await api()
      .post('/api/leave/applications')
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({
        leaveTypeId: TYPE_ID,
        fromDate: '2026-04-01',
        toDate: '2026-04-03',
        reason: 'Family event',
      })
      .expect(201);
    expect(
      body<{ days: number; applicantKind: string }>(applied).data,
    ).toMatchObject({ days: 3, applicantKind: 'staff' });

    // Guards run before pipes: a non-approver is refused before the id is parsed.
    await api()
      .post('/api/leave/applications/app/approve')
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({})
      .expect(403);
    await api()
      .post('/api/leave/applications/app/approve')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({})
      .expect(400);
    const appId = '88888888-8888-4888-8888-888888888888';
    await api()
      .post(`/api/leave/applications/${appId}/approve`)
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({})
      .expect(403);

    const row: LeaveApplicationRow = {
      id: appId,
      institutionId: INSTITUTION_ID,
      leaveTypeId: TYPE_ID,
      applicantKind: 'staff',
      userId: 'teacher',
      studentId: null,
      fromDate: '2026-04-01',
      toDate: '2026-04-03',
      reason: 'x',
      status: 'pending',
      appliedBy: 'teacher',
      decidedBy: null,
      decidedAt: null,
      decisionNote: null,
      createdAt: new Date(),
    };
    leave.findById.mockResolvedValue(row);
    leave.decide.mockResolvedValue({
      ...row,
      status: 'approved',
      decidedBy: 'admin',
    });
    audit.insert.mockResolvedValue();
    const approved = await api()
      .post(`/api/leave/applications/${appId}/approve`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ note: 'ok' })
      .expect(200);
    expect(body<{ status: string }>(approved).data?.status).toBe('approved');
  });
});
