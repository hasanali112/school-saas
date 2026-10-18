import { BadRequestException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AuthUser } from '@module/auth/domain/auth-user';
import { Role } from '@module/auth/domain/role';
import type { Consent } from '../domain/consent';
import { AuditLogPort } from '@module/audit/application/ports/audit-log.port';
import type { AuditEntry } from '@module/audit/domain/audit-entry';
import { createMock, getMock } from '@test/utils/create-mock';
import { containing } from '@test/utils/matchers';
import { CURRENT_NOTICE_VERSION } from '../domain/consent.constants';
import { ConsentRepository } from '../application/ports/consent.repository.port';
import { ConsentService } from './consent.service';
import { ConsentPurpose, ConsentSource } from '../domain/consent';

const actor: AuthUser = {
  id: 'officer',
  institutionId: 'inst-1',
  roles: [Role.AdminOfficer],
};
const row = (overrides: Partial<Consent> = {}): Consent => ({
  id: 'c1',
  institutionId: 'inst-1',
  guardianId: 'g1',
  purpose: ConsentPurpose.Sms,
  granted: true,
  noticeVersion: CURRENT_NOTICE_VERSION,
  source: ConsentSource.Paper,
  recordedBy: 'officer',
  note: null,
  createdAt: new Date('2026-09-01'),
  updatedAt: new Date('2026-09-01'),
  ...overrides,
});

describe('ConsentService', () => {
  let service: ConsentService;
  let repo: jest.Mocked<ConsentRepository>;
  let audit: jest.Mocked<AuditLogPort>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [ConsentService],
    })
      .useMocker(createMock)
      .compile();
    service = moduleRef.get(ConsentService);
    repo = getMock(moduleRef, ConsentRepository);
    audit = getMock(moduleRef, AuditLogPort);
  });

  it('records consent for a purpose at the current notice version and audits the change', async () => {
    repo.findOne.mockResolvedValue(undefined);
    repo.upsert.mockResolvedValue(row());

    const result = await service.record(
      'g1',
      {
        purpose: ConsentPurpose.Sms,
        granted: true,
        source: ConsentSource.Paper,
      },
      actor,
    );

    expect(repo.upsert).toHaveBeenCalledWith({
      institutionId: 'inst-1',
      guardianId: 'g1',
      purpose: 'sms',
      granted: true,
      noticeVersion: CURRENT_NOTICE_VERSION,
      source: 'paper',
      recordedBy: 'officer',
      note: null,
    });
    expect(result).toMatchObject({ purpose: 'sms', granted: true });
    expect(audit.record).toHaveBeenCalledWith(
      containing<AuditEntry>({
        action: 'consent.recorded',
        entity: 'guardian',
        entityId: 'g1',
        before: null,
        after: {
          purpose: 'sms',
          granted: true,
          noticeVersion: CURRENT_NOTICE_VERSION,
        },
      }),
    );
  });

  it('keeps the previous state in the audit entry when consent is withdrawn', async () => {
    repo.findOne.mockResolvedValue(row());
    repo.upsert.mockResolvedValue(row({ granted: false }));

    await service.record(
      'g1',
      {
        purpose: ConsentPurpose.Sms,
        granted: false,
        source: ConsentSource.Phone,
      },
      actor,
    );

    expect(audit.record).toHaveBeenCalledWith(
      containing<AuditEntry>({
        before: {
          purpose: 'sms',
          granted: true,
          noticeVersion: CURRENT_NOTICE_VERSION,
        },
      }),
    );
  });

  it('rejects an unknown guardian as a bad request', async () => {
    repo.findOne.mockResolvedValue(undefined);
    repo.upsert.mockRejectedValue(fkViolation());

    await expect(
      service.record(
        'nope',
        {
          purpose: ConsentPurpose.Sms,
          granted: true,
          source: ConsentSource.Office,
        },
        actor,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('lists the consents of a guardian without internal columns', async () => {
    repo.findForGuardian.mockResolvedValue([row()]);
    const [dto] = await service.list('g1');
    expect(dto).toEqual({
      purpose: 'sms',
      granted: true,
      noticeVersion: CURRENT_NOTICE_VERSION,
      source: 'paper',
      note: null,
      updatedAt: new Date('2026-09-01'),
    });
  });
});

function fkViolation(): Error {
  const { DatabaseError } = jest.requireActual<typeof import('pg')>('pg');
  const cause = new DatabaseError('fk', 0, 'error');
  cause.code = '23503';
  return Object.assign(new Error('insert failed'), { cause });
}
