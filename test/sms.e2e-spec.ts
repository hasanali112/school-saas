import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import type { Server } from 'node:http';
import request from 'supertest';
import { ApiResponse } from '@common/types/api-response';
import { Role } from '@modules/auth/roles';
import { DatabaseService } from '@database/database.service';
import { InstitutionRow, SmsBatchRow, SmsMessageRow } from '@database/schema';
import { SessionsRepository } from '@modules/academics/sessions/sessions.repository';
import { ConsentRepository } from '@modules/consent/consent.repository';
import { InstitutionsRepository } from '@modules/institutions/institutions.repository';
import { AudienceRepository } from '@modules/sms/audience/audience.repository';
import { BalanceRepository } from '@modules/sms/balance/balance.repository';
import { BatchesRepository } from '@modules/sms/batches/batches.repository';
import { DeliveryReportsRepository } from '@modules/sms/delivery/delivery-reports.repository';
import { SMS_GATEWAY } from '@modules/sms/gateway/sms.gateway';
import type { SmsGateway } from '@modules/sms/gateway/sms.gateway';
import { TemplatesRepository } from '@modules/sms/templates/templates.repository';
import { AuditRepository } from '@shared/audit/audit.repository';
import { createMock } from '@test/utils/create-mock';
import { AppModule } from '../src/app.module';
import { setupApp } from '../src/app.setup';

const INSTITUTION_ID = '11111111-1111-4111-8111-111111111111';
const SECTION_ID = '44444444-4444-4444-8444-444444444444';
const GUARDIAN_ID = '88888888-8888-4888-8888-888888888888';
const BATCH_ID = '99999999-9999-4999-8999-999999999999';
const DLR_SECRET = 'correct-horse-battery-staple';
const institutionRow: InstitutionRow = {
  id: INSTITUTION_ID,
  slug: 'demo',
  nameBn: 'ডেমো',
  nameEn: 'Demo School',
  eiin: null,
  addressBn: null,
  addressEn: null,
  phone: null,
  createdAt: new Date('2026-01-01'),
};

const batchRow = (overrides: Partial<SmsBatchRow> = {}): SmsBatchRow => ({
  id: BATCH_ID,
  institutionId: INSTITUTION_ID,
  purpose: 'general',
  status: 'draft',
  templateKey: null,
  body: 'Hello',
  dedupeKey: null,
  recipientCount: 1,
  segmentCount: 1,
  costPaisa: 30,
  sentCount: 0,
  failedCount: 0,
  createdBy: 'admin',
  sentBy: null,
  sentAt: null,
  createdAt: new Date(),
  ...overrides,
});
const messageRow: SmsMessageRow = {
  id: 'm1',
  institutionId: INSTITUTION_ID,
  batchId: BATCH_ID,
  guardianId: GUARDIAN_ID,
  studentId: 's1',
  phone: '01711111111',
  body: 'Hello',
  segments: 1,
  costPaisa: 30,
  status: 'pending',
  gateway: null,
  providerMessageId: null,
  error: null,
  sentAt: null,
  deliveredAt: null,
  createdAt: new Date(),
};

describe('SMS & consent (e2e)', () => {
  let app: INestApplication;
  let adminToken: string;
  let teacherToken: string;
  const api = () => request(app.getHttpServer() as Server);
  const body = <T>(res: request.Response): ApiResponse<T> =>
    res.body as ApiResponse<T>;
  const audience = createMock<AudienceRepository>();
  const balance = createMock<BalanceRepository>();
  const batches = createMock<BatchesRepository>();
  const templates = createMock<TemplatesRepository>();
  const consent = createMock<ConsentRepository>();
  const delivery = createMock<DeliveryReportsRepository>();
  const gateway = createMock<SmsGateway>();
  const sessions = createMock<SessionsRepository>();
  const institutions = createMock<InstitutionsRepository>();

  beforeAll(async () => {
    process.env.SMS_DELIVERY_REPORT_SECRET = DLR_SECRET;
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(AudienceRepository)
      .useValue(audience)
      .overrideProvider(BalanceRepository)
      .useValue(balance)
      .overrideProvider(BatchesRepository)
      .useValue(batches)
      .overrideProvider(TemplatesRepository)
      .useValue(templates)
      .overrideProvider(ConsentRepository)
      .useValue(consent)
      .overrideProvider(DeliveryReportsRepository)
      .useValue(delivery)
      .overrideProvider(SMS_GATEWAY)
      .useValue(gateway)
      .overrideProvider(SessionsRepository)
      .useValue(sessions)
      .overrideProvider(InstitutionsRepository)
      .useValue(institutions)
      .overrideProvider(AuditRepository)
      .useValue(createMock<AuditRepository>())
      .overrideProvider(DatabaseService)
      .useValue({})
      .compile();
    app = setupApp(moduleRef.createNestApplication());
    await app.init();
    const jwt = app.get(JwtService);
    adminToken = jwt.sign({
      sub: 'admin',
      institutionId: INSTITUTION_ID,
      roles: [Role.InstituteHead],
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
    sessions.findCurrentId.mockResolvedValue('sess-1');
    institutions.findCurrent.mockResolvedValue(institutionRow);
    audience.findGuardianRecipients.mockResolvedValue([
      {
        studentId: 's1',
        studentNameBn: 'করিম',
        studentNameEn: 'Karim',
        rollNo: 1,
        className: 'Six',
        sectionName: 'A',
        guardianId: GUARDIAN_ID,
        guardianName: 'Rahim',
        phone: '01711111111',
        smsConsent: true,
      },
      {
        studentId: 's2',
        studentNameBn: 'রহিম',
        studentNameEn: 'Rahim',
        rollNo: 2,
        className: 'Six',
        sectionName: 'A',
        guardianId: 'g2',
        guardianName: 'Karim',
        phone: '01722222222',
        smsConsent: null,
      },
    ]);
    balance.find.mockResolvedValue({
      institutionId: INSTITUTION_ID,
      balancePaisa: 10,
      ratePaisaPerSegment: null,
      updatedAt: new Date(),
    });
  });

  it('POST /api/sms/preview prices the message and excludes guardians without consent', async () => {
    const res = await api()
      .post('/api/sms/preview')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        purpose: 'general',
        message: 'ক'.repeat(71),
        audience: { sectionId: SECTION_ID },
      })
      .expect(200);
    expect(body(res).data).toMatchObject({
      recipientCount: 1,
      segmentCount: 2,
      costPaisa: 60,
      shortfallPaisa: 50,
      excluded: { noConsent: 1 },
    });
  });

  it('POST /api/sms/preview validates the audience shape', async () => {
    const res = await api()
      .post('/api/sms/preview')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ purpose: 'general', message: 'x', audience: { phones: ['123'] } })
      .expect(400);
    expect(body(res).error?.code).toBe('VALIDATION_ERROR');
  });

  it('a teacher cannot compose SMS', async () => {
    await api()
      .post('/api/sms/batches')
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({
        purpose: 'general',
        message: 'x',
        audience: { sectionId: SECTION_ID },
      })
      .expect(403);
  });

  it('POST /api/sms/batches drafts and returns the preview alongside the batch', async () => {
    batches.insertDraft.mockResolvedValue(batchRow());
    const res = await api()
      .post('/api/sms/batches')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        purpose: 'general',
        message: 'Hello',
        audience: { sectionId: SECTION_ID },
      })
      .expect(201);
    expect(body(res).data).toMatchObject({
      id: BATCH_ID,
      status: 'draft',
      preview: { recipientCount: 1, costPaisa: 30 },
    });
  });

  it('POST /api/sms/batches/:id/send answers 402 with the shortfall when the balance is short', async () => {
    batches.findById.mockResolvedValue(batchRow());
    batches.markSending.mockResolvedValue(batchRow({ status: 'sending' }));
    balance.debit.mockResolvedValue(undefined);

    const res = await api()
      .post(`/api/sms/batches/${BATCH_ID}/send`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(402);

    expect(body(res).error).toMatchObject({
      code: 'PAYMENT_REQUIRED',
      message: 'Insufficient SMS balance: short by 20 paisa',
    });
    expect(batches.revertToDraft).toHaveBeenCalledWith(BATCH_ID);
  });

  it('POST /api/sms/batches/:id/send delivers and reports which gateway carried each message', async () => {
    batches.findById.mockResolvedValue(batchRow());
    batches.markSending.mockResolvedValue(batchRow({ status: 'sending' }));
    balance.debit.mockResolvedValue({
      institutionId: INSTITUTION_ID,
      balancePaisa: 0,
      ratePaisaPerSegment: null,
      updatedAt: new Date(),
    });
    batches.findMessages.mockResolvedValue([messageRow]);
    gateway.send.mockResolvedValue({
      providerMessageId: 'p1',
      gateway: 'secondary',
    });
    batches.finish.mockResolvedValue(
      batchRow({ status: 'sent', sentCount: 1 }),
    );

    const res = await api()
      .post(`/api/sms/batches/${BATCH_ID}/send`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(body(res).data).toMatchObject({ status: 'sent', sentCount: 1 });
    expect(batches.recordResults).toHaveBeenCalledWith([
      expect.objectContaining({
        gateway: 'secondary',
        providerMessageId: 'p1',
      }),
    ]);
  });

  it('GET /api/sms/batches pages the log', async () => {
    batches.findPage.mockResolvedValue({ rows: [batchRow()], total: 1 });
    const res = await api()
      .get('/api/sms/batches?limit=10')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
    expect(body(res).meta).toEqual({ total: 1, page: 1, limit: 10 });
  });

  it('POST /api/sms/balance/top-ups is for the head only and audits', async () => {
    balance.topUp.mockResolvedValue({
      institutionId: INSTITUTION_ID,
      balancePaisa: 5010,
      ratePaisaPerSegment: null,
      updatedAt: new Date(),
    });
    await api()
      .post('/api/sms/balance/top-ups')
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({ amountPaisa: 5000 })
      .expect(403);
    const res = await api()
      .post('/api/sms/balance/top-ups')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ amountPaisa: 5000, note: 'cash' })
      .expect(201);
    expect(body(res).data).toEqual({
      balancePaisa: 5010,
      ratePaisaPerSegment: 30,
    });
  });

  it('PUT /api/sms/templates/:key rejects unknown merge fields', async () => {
    const res = await api()
      .put('/api/sms/templates/absence')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Absence', body: 'Hi {{nickname}}' })
      .expect(400);
    expect(body(res).error?.message).toContain('nickname');
  });

  it('PUT /api/guardians/:id/consents records consent and GET lists it', async () => {
    const row = {
      id: 'c1',
      institutionId: INSTITUTION_ID,
      guardianId: GUARDIAN_ID,
      purpose: 'sms' as const,
      granted: true,
      noticeVersion: '2026-01',
      source: 'paper' as const,
      recordedBy: 'admin',
      note: 'form #12',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    consent.findOne.mockResolvedValue(undefined);
    consent.upsert.mockResolvedValue(row);
    consent.findForGuardian.mockResolvedValue([row]);

    await api()
      .put(`/api/guardians/${GUARDIAN_ID}/consents`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        purpose: 'sms',
        granted: true,
        source: 'paper',
        note: 'form #12',
      })
      .expect(200);
    const res = await api()
      .get(`/api/guardians/${GUARDIAN_ID}/consents`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
    expect(body<unknown[]>(res).data).toEqual([
      expect.objectContaining({
        purpose: 'sms',
        granted: true,
        source: 'paper',
      }),
    ]);
  });

  it('POST /api/sms/delivery-reports is public but needs the shared secret', async () => {
    delivery.applyReport.mockResolvedValue(true);
    await api()
      .post('/api/sms/delivery-reports')
      .send({ providerMessageId: 'p1', status: 'delivered' })
      .expect(401);
    await api()
      .post('/api/sms/delivery-reports')
      .set('X-Delivery-Report-Secret', DLR_SECRET)
      .send({ providerMessageId: 'p1', status: 'delivered' })
      .expect(204);
    expect(delivery.applyReport).toHaveBeenCalledWith(
      'p1',
      'delivered',
      undefined,
    );
  });
});
