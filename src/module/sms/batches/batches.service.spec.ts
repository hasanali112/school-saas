import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { todayLocal } from '@shared/time/local-date';
import { AuthUser } from '@modules/auth/auth-user';
import { Role } from '@modules/auth/roles';
import {
  InstitutionRow,
  NewSmsBatchRow,
  SmsBatchRow,
  SmsMessageRow,
} from '@database/schema';
import { SessionsService } from '@modules/academics/sessions/sessions.service';
import { InstitutionResponseDto } from '@modules/institutions/dto/institution.response.dto';
import { InstitutionsService } from '@modules/institutions/institutions.service';
import { AuditService } from '@shared/audit/audit.service';
import type { AuditEntry, AuditSnapshot } from '@shared/audit/audit.service';
import { createMock, getMock } from '@test/utils/create-mock';
import { anyOf, containing } from '@test/utils/matchers';
import {
  AudienceService,
  ResolvedAudience,
} from '../audience/audience.service';
import {
  BalanceService,
  InsufficientBalanceException,
} from '../balance/balance.service';
import { SmsPurpose } from '../dto/compose.dto';
import { SMS_GATEWAY } from '../gateway/sms.gateway';
import type { SmsGateway } from '../gateway/sms.gateway';
import { TemplatesService } from '../templates/templates.service';
import { BatchesRepository, DraftMessage } from './batches.repository';
import { BatchesService } from './batches.service';

const actor: AuthUser = {
  id: 'officer',
  institutionId: 'inst-1',
  roles: [Role.AdminOfficer],
};
const TODAY = todayLocal();
const institutionRow: InstitutionRow = {
  id: 'inst-1',
  slug: 'demo',
  nameBn: 'ডেমো স্কুল',
  nameEn: 'Demo School',
  eiin: null,
  addressBn: null,
  addressEn: null,
  phone: null,
  createdAt: new Date('2026-01-01'),
};
const audience: ResolvedAudience = {
  recipients: [
    {
      phone: '01711111111',
      guardianId: 'g1',
      studentId: 's1',
      fields: { studentName: 'করিম', guardianName: 'Rahim' },
    },
    {
      phone: '01722222222',
      guardianId: 'g2',
      studentId: 's2',
      fields: { studentName: 'রহিম', guardianName: 'Karim' },
    },
    // Same guardian, second child: distinct message, so both are kept.
    {
      phone: '01711111111',
      guardianId: 'g1',
      studentId: 's3',
      fields: { studentName: 'সালমা', guardianName: 'Rahim' },
    },
  ],
  excluded: { noConsent: 1 },
};
const batchRow = (overrides: Partial<SmsBatchRow> = {}): SmsBatchRow => ({
  id: 'b1',
  institutionId: 'inst-1',
  purpose: 'general',
  status: 'draft',
  templateKey: null,
  body: 'Hello {{studentName}}',
  dedupeKey: null,
  recipientCount: 2,
  segmentCount: 2,
  costPaisa: 60,
  sentCount: 0,
  failedCount: 0,
  createdBy: 'officer',
  sentBy: null,
  sentAt: null,
  createdAt: new Date('2026-09-08'),
  ...overrides,
});
const messageRow = (overrides: Partial<SmsMessageRow> = {}): SmsMessageRow => ({
  id: 'm1',
  institutionId: 'inst-1',
  batchId: 'b1',
  guardianId: 'g1',
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
  createdAt: new Date('2026-09-08'),
  ...overrides,
});

describe('BatchesService', () => {
  let service: BatchesService;
  let repo: jest.Mocked<BatchesRepository>;
  let balance: jest.Mocked<BalanceService>;
  let gateway: jest.Mocked<SmsGateway>;
  let audit: jest.Mocked<AuditService>;
  let templates: jest.Mocked<TemplatesService>;
  let audienceService: jest.Mocked<AudienceService>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [BatchesService],
    })
      .useMocker(createMock)
      .compile();
    service = moduleRef.get(BatchesService);
    repo = getMock(moduleRef, BatchesRepository);
    balance = getMock(moduleRef, BalanceService);
    gateway = getMock<SmsGateway>(moduleRef, SMS_GATEWAY);
    audit = getMock(moduleRef, AuditService);
    templates = getMock(moduleRef, TemplatesService);

    getMock(moduleRef, SessionsService).resolveId.mockResolvedValue('sess-1');
    getMock(moduleRef, InstitutionsService).getCurrent.mockResolvedValue(
      InstitutionResponseDto.from(institutionRow),
    );
    audienceService = getMock(moduleRef, AudienceService);
    audienceService.resolve.mockResolvedValue(audience);
    balance.get.mockResolvedValue({
      balancePaisa: 50,
      ratePaisaPerSegment: 30,
    });
  });

  describe('preview', () => {
    it('renders per recipient, prices Unicode segments at the institution rate and shows the shortfall', async () => {
      const preview = await service.preview({
        purpose: SmsPurpose.General,
        message: '{{studentName}}, ' + 'ক'.repeat(69),
        audience: { sectionId: 'sec-1' },
      });

      // 3 recipients x 2 Unicode segments each (71+ chars) = 6 segments x 30 paisa.
      expect(preview).toEqual({
        recipientCount: 3,
        segmentCount: 6,
        costPaisa: 180,
        balancePaisa: 50,
        shortfallPaisa: 130,
        encoding: 'unicode',
        excluded: { noConsent: 1 },
        sample: 'করিম, ' + 'ক'.repeat(69),
      });
    });

    it('collapses identical messages to the same phone into one', async () => {
      const preview = await service.preview({
        purpose: SmsPurpose.General,
        message: 'School closed tomorrow',
        audience: { sectionId: 'sec-1' },
      });
      expect(preview.recipientCount).toBe(2);
      expect(preview).toMatchObject({
        segmentCount: 2,
        costPaisa: 60,
        shortfallPaisa: 10,
      });
    });

    it('fills date and institution name from the composer, not the audience', async () => {
      templates.resolve.mockResolvedValue('{{date}} {{institutionName}}');
      const preview = await service.preview({
        purpose: SmsPurpose.General,
        templateKey: 'general',
        audience: { sectionId: 'sec-1' },
      });
      expect(preview.sample).toBe(`${TODAY} ডেমো স্কুল`);
    });

    it('requires exactly one of message and templateKey', async () => {
      await expect(
        service.preview({
          purpose: SmsPurpose.General,
          audience: { sectionId: 'sec-1' },
        }),
      ).rejects.toBeInstanceOf(BadRequestException);
      await expect(
        service.preview({
          purpose: SmsPurpose.General,
          message: 'x',
          templateKey: 'general',
          audience: { sectionId: 'sec-1' },
        }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('explains which merge fields the audience cannot fill', async () => {
      await expect(
        service.preview({
          purpose: SmsPurpose.General,
          message: 'Hi {{name}} {{rollNo}}',
          audience: { sectionId: 'sec-1' },
        }),
      ).rejects.toThrow('name, rollNo');
    });

    it('rejects an audience that resolves to nobody', async () => {
      audienceService.resolve.mockResolvedValue({
        recipients: [],
        excluded: { noConsent: 3 },
      });
      await expect(
        service.preview({
          purpose: SmsPurpose.General,
          message: 'x',
          audience: { sectionId: 'sec-1' },
        }),
      ).rejects.toThrow('No recipients');
    });
  });

  describe('create', () => {
    it('persists the draft with one message row per recipient and the preview totals', async () => {
      repo.insertDraft.mockResolvedValue(
        batchRow({ recipientCount: 3, segmentCount: 3, costPaisa: 90 }),
      );

      const result = await service.create(
        {
          purpose: SmsPurpose.General,
          message: 'Hello {{studentName}}',
          audience: { sectionId: 'sec-1' },
        },
        actor,
      );

      expect(repo.insertDraft).toHaveBeenCalledWith(
        {
          institutionId: 'inst-1',
          purpose: 'general',
          templateKey: null,
          body: 'Hello {{studentName}}',
          dedupeKey: null,
          recipientCount: 3,
          segmentCount: 3,
          costPaisa: 90,
          createdBy: 'officer',
        },
        [
          expect.objectContaining({
            phone: '01711111111',
            studentId: 's1',
            body: 'Hello করিম',
            segments: 1,
            costPaisa: 30,
          }),
          expect.objectContaining({ phone: '01722222222', studentId: 's2' }),
          expect.objectContaining({ phone: '01711111111', studentId: 's3' }),
        ],
      );
      expect(result).toMatchObject({
        id: 'b1',
        status: 'draft',
        preview: { recipientCount: 3, costPaisa: 90, shortfallPaisa: 40 },
      });
    });
  });

  describe('send', () => {
    beforeEach(() => {
      repo.findById.mockResolvedValue(batchRow());
      repo.markSending.mockResolvedValue(batchRow({ status: 'sending' }));
      repo.findMessages.mockResolvedValue([
        messageRow(),
        messageRow({ id: 'm2', phone: '01722222222', studentId: 's2' }),
      ]);
      balance.charge.mockResolvedValue(0);
      repo.finish.mockImplementation((id, patch) =>
        Promise.resolve(batchRow({ id, ...patch, status: patch.status })),
      );
    });

    it('charges, dispatches through the gateway, logs which gateway delivered and audits the spend', async () => {
      gateway.send
        .mockResolvedValueOnce({ providerMessageId: 'p1', gateway: 'primary' })
        .mockResolvedValueOnce({
          providerMessageId: 'p2',
          gateway: 'secondary',
        });

      const result = await service.send('b1', actor);

      expect(balance.charge).toHaveBeenCalledWith('b1', 60, 'officer');
      expect(gateway.send).toHaveBeenCalledTimes(2);
      expect(repo.recordResults).toHaveBeenCalledWith([
        {
          id: 'm1',
          status: 'sent',
          gateway: 'primary',
          providerMessageId: 'p1',
          error: null,
        },
        {
          id: 'm2',
          status: 'sent',
          gateway: 'secondary',
          providerMessageId: 'p2',
          error: null,
        },
      ]);
      expect(balance.refund).toHaveBeenCalledWith('b1', 0);
      expect(repo.finish).toHaveBeenCalledWith('b1', {
        status: 'sent',
        sentCount: 2,
        failedCount: 0,
        sentBy: 'officer',
      });
      expect(result).toMatchObject({ status: 'sent', sentCount: 2 });
      expect(audit.record).toHaveBeenCalledWith(
        containing<AuditEntry>({
          action: 'sms.batch.sent',
          entityId: 'b1',
          after: containing<AuditSnapshot>({
            costPaisa: 60,
            refundedPaisa: 0,
          }),
        }),
      );
    });

    it('refunds the failed messages and keeps the batch sent when some got through', async () => {
      gateway.send
        .mockResolvedValueOnce({ providerMessageId: 'p1', gateway: 'primary' })
        .mockRejectedValueOnce(new Error('both gateways down'));

      const result = await service.send('b1', actor);

      expect(repo.recordResults).toHaveBeenCalledWith([
        expect.objectContaining({ id: 'm1', status: 'sent' }),
        {
          id: 'm2',
          status: 'failed',
          gateway: null,
          providerMessageId: null,
          error: 'both gateways down',
        },
      ]);
      expect(balance.refund).toHaveBeenCalledWith('b1', 30);
      expect(result).toMatchObject({
        status: 'sent',
        sentCount: 1,
        failedCount: 1,
      });
    });

    it('marks the batch failed when nothing was delivered', async () => {
      gateway.send.mockRejectedValue(new Error('down'));
      const result = await service.send('b1', actor);
      expect(balance.refund).toHaveBeenCalledWith('b1', 60);
      expect(result.status).toBe('failed');
    });

    it('puts the batch back to draft and rethrows when the balance is short', async () => {
      balance.charge.mockRejectedValue(new InsufficientBalanceException(10));

      await expect(service.send('b1', actor)).rejects.toBeInstanceOf(
        InsufficientBalanceException,
      );
      expect(repo.revertToDraft).toHaveBeenCalledWith('b1');
      expect(gateway.send).not.toHaveBeenCalled();
    });

    it('refuses to send a batch that is not a draft', async () => {
      repo.findById.mockResolvedValue(batchRow({ status: 'sent' }));
      await expect(service.send('b1', actor)).rejects.toBeInstanceOf(
        ConflictException,
      );
    });

    it('treats a concurrent send as a conflict', async () => {
      repo.markSending.mockResolvedValue(undefined);
      await expect(service.send('b1', actor)).rejects.toBeInstanceOf(
        ConflictException,
      );
      expect(balance.charge).not.toHaveBeenCalled();
    });

    it('404s an unknown batch', async () => {
      repo.findById.mockResolvedValue(undefined);
      await expect(service.send('nope', actor)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('draftForSystem', () => {
    const input = {
      institutionId: 'inst-1',
      purpose: 'absence' as const,
      templateKey: 'absence',
      audience: { studentIds: ['s1'] },
      dedupeKey: 'absence:sec-1:2026-09-08:0',
    };

    beforeEach(() => {
      templates.resolve.mockResolvedValue('Hi {{studentName}}');
      repo.insertDraft.mockResolvedValue(
        batchRow({ purpose: 'absence', createdBy: null }),
      );
    });

    it('drafts with no actor and the dedupe key', async () => {
      repo.findByDedupeKey.mockResolvedValue(undefined);
      const result = await service.draftForSystem(input);
      expect(repo.insertDraft).toHaveBeenCalledWith(
        containing<NewSmsBatchRow>({
          createdBy: null,
          dedupeKey: input.dedupeKey,
          templateKey: 'absence',
        }),
        anyOf<DraftMessage[]>(Array),
      );
      expect(result?.purpose).toBe('absence');
    });

    it('replaces an existing draft for the same key', async () => {
      repo.findByDedupeKey.mockResolvedValue(
        batchRow({ id: 'old', status: 'draft' }),
      );
      await service.draftForSystem(input);
      expect(repo.deleteDraft).toHaveBeenCalledWith('old');
      expect(repo.insertDraft).toHaveBeenCalled();
    });

    it('leaves a batch alone once it has been sent', async () => {
      repo.findByDedupeKey.mockResolvedValue(
        batchRow({ id: 'old', status: 'sent' }),
      );
      await expect(service.draftForSystem(input)).resolves.toBeUndefined();
      expect(repo.insertDraft).not.toHaveBeenCalled();
    });

    it('drafts nothing when every guardian lacks consent', async () => {
      repo.findByDedupeKey.mockResolvedValue(undefined);
      audienceService.resolve.mockResolvedValue({
        recipients: [],
        excluded: { noConsent: 1 },
      });
      await expect(service.draftForSystem(input)).resolves.toBeUndefined();
      expect(repo.insertDraft).not.toHaveBeenCalled();
    });
  });

  describe('cancel', () => {
    it('cancels a draft', async () => {
      repo.findById.mockResolvedValue(batchRow());
      repo.cancel.mockResolvedValue(batchRow({ status: 'cancelled' }));
      await expect(service.cancel('b1')).resolves.toMatchObject({
        status: 'cancelled',
      });
    });

    it('refuses to cancel anything but a draft', async () => {
      repo.findById.mockResolvedValue(batchRow({ status: 'sending' }));
      await expect(service.cancel('b1')).rejects.toBeInstanceOf(
        ConflictException,
      );
    });
  });
});
