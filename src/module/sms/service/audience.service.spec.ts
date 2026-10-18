import { Test } from '@nestjs/testing';
import { Role } from '@module/auth/domain/role';
import { createMock, getMock } from '@test/utils/create-mock';
import type { GuardianRecipient, StaffRecipient } from '../domain/audience';
import { AudienceRepositoryPort } from '../port/audience.repository.port';
import { AudienceService } from './audience.service';

const guardianRow = (
  overrides: Partial<GuardianRecipient> = {},
): GuardianRecipient => ({
  studentId: 's1',
  studentNameBn: 'করিম',
  studentNameEn: 'Karim',
  rollNo: 7,
  className: 'Six',
  sectionName: 'A',
  guardianId: 'g1',
  guardianName: 'Rahim',
  phone: '01711111111',
  smsConsent: true,
  ...overrides,
});
const staffRow = (overrides: Partial<StaffRecipient> = {}): StaffRecipient => ({
  userId: 'u1',
  name: 'Teacher',
  phone: '01722222222',
  ...overrides,
});

describe('AudienceService', () => {
  let service: AudienceService;
  let repo: jest.Mocked<AudienceRepositoryPort>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [AudienceService],
    })
      .useMocker(createMock)
      .compile();
    service = moduleRef.get(AudienceService);
    repo = getMock(moduleRef, AudienceRepositoryPort);
    repo.findGuardianRecipients.mockResolvedValue([]);
    repo.findStaffRecipients.mockResolvedValue([]);
  });

  it('turns a section audience into primary-guardian recipients with merge fields', async () => {
    repo.findGuardianRecipients.mockResolvedValue([guardianRow()]);

    const result = await service.resolve({ sectionId: 'sec-1' }, 'sess-1');

    expect(repo.findGuardianRecipients).toHaveBeenCalledWith({
      sessionId: 'sess-1',
      sectionId: 'sec-1',
    });
    expect(result.recipients).toEqual([
      {
        phone: '01711111111',
        guardianId: 'g1',
        studentId: 's1',
        fields: {
          studentName: 'করিম',
          studentNameEn: 'Karim',
          guardianName: 'Rahim',
          className: 'Six',
          sectionName: 'A',
          rollNo: '7',
        },
      },
    ]);
    expect(result.excluded).toEqual({ noConsent: 0 });
  });

  it('drops guardians without SMS consent and counts them (F1-12 acceptance)', async () => {
    repo.findGuardianRecipients.mockResolvedValue([
      guardianRow(),
      guardianRow({
        studentId: 's2',
        guardianId: 'g2',
        phone: '01733333333',
        smsConsent: false,
      }),
      guardianRow({
        studentId: 's3',
        guardianId: 'g3',
        phone: '01744444444',
        smsConsent: null,
      }),
    ]);

    const result = await service.resolve({ classId: 'cls-1' }, 'sess-1');

    expect(result.recipients.map((r) => r.guardianId)).toEqual(['g1']);
    expect(result.excluded).toEqual({ noConsent: 2 });
  });

  it('adds staff by role and ad-hoc phones, which need no consent', async () => {
    repo.findStaffRecipients.mockResolvedValue([staffRow()]);

    const result = await service.resolve(
      { roles: [Role.SubjectTeacher], phones: ['01755555555'] },
      'sess-1',
    );

    expect(repo.findStaffRecipients).toHaveBeenCalledWith([
      Role.SubjectTeacher,
    ]);
    expect(repo.findGuardianRecipients).not.toHaveBeenCalled();
    expect(result.recipients).toEqual([
      { phone: '01722222222', userId: 'u1', fields: { name: 'Teacher' } },
      { phone: '01755555555', fields: {} },
    ]);
  });

  it('queries guardians once with every student filter combined', async () => {
    await service.resolve({ studentIds: ['s1', 's2'] }, 'sess-1');
    expect(repo.findGuardianRecipients).toHaveBeenCalledWith({
      sessionId: 'sess-1',
      studentIds: ['s1', 's2'],
    });
  });
});
