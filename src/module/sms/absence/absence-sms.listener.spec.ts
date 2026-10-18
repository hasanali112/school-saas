import { Test } from '@nestjs/testing';
import { AttendanceMarkedEvent } from '@modules/attendance/events/attendance-marked.event';
import { createMock, getMock } from '@test/utils/create-mock';
import { BatchesService } from '../batches/batches.service';
import { AbsenceSmsListener } from './absence-sms.listener';

describe('AbsenceSmsListener', () => {
  let listener: AbsenceSmsListener;
  let batches: jest.Mocked<BatchesService>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [AbsenceSmsListener],
    })
      .useMocker(createMock)
      .compile();
    listener = moduleRef.get(AbsenceSmsListener);
    batches = getMock(moduleRef, BatchesService);
  });

  it('drafts an absence batch for the absentees keyed by section, date and period', async () => {
    batches.draftForSystem.mockResolvedValue(undefined);

    await listener.onAttendanceMarked(
      new AttendanceMarkedEvent(
        'inst-1',
        'sec-1',
        '2026-09-08',
        0,
        ['s1', 's2'],
        'teacher',
      ),
    );

    expect(batches.draftForSystem).toHaveBeenCalledWith({
      institutionId: 'inst-1',
      purpose: 'absence',
      templateKey: 'absence',
      audience: { studentIds: ['s1', 's2'] },
      dedupeKey: 'absence:sec-1:2026-09-08:0',
    });
  });

  it('does nothing when nobody was absent', async () => {
    await listener.onAttendanceMarked(
      new AttendanceMarkedEvent(
        'inst-1',
        'sec-1',
        '2026-09-08',
        0,
        [],
        'teacher',
      ),
    );
    expect(batches.draftForSystem).not.toHaveBeenCalled();
  });

  it('swallows drafting errors so attendance marking never fails because of SMS', async () => {
    batches.draftForSystem.mockRejectedValue(new Error('db down'));
    await expect(
      listener.onAttendanceMarked(
        new AttendanceMarkedEvent(
          'inst-1',
          'sec-1',
          '2026-09-08',
          0,
          ['s1'],
          'teacher',
        ),
      ),
    ).resolves.toBeUndefined();
  });
});
