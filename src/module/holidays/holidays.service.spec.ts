import { BadRequestException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { createMock, getMock } from '@test/utils/create-mock';
import { HolidaysRepository } from './holidays.repository';
import { HolidaysService } from './holidays.service';

describe('HolidaysService', () => {
  let service: HolidaysService;
  let repo: jest.Mocked<HolidaysRepository>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [HolidaysService],
    })
      .useMocker(createMock)
      .compile();
    service = moduleRef.get(HolidaysService);
    repo = getMock(moduleRef, HolidaysRepository);
  });

  it('defaults the range to the current calendar year', async () => {
    repo.findBetween.mockResolvedValue([]);
    await service.list({});
    const year = new Date().getUTCFullYear();
    expect(repo.findBetween).toHaveBeenCalledWith(
      `${year}-01-01`,
      `${year}-12-31`,
    );
  });

  it('rejects an inverted range', async () => {
    await expect(
      service.list({ from: '2026-12-01', to: '2026-01-01' }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('isHoliday truncates a timestamp to its date', async () => {
    repo.existsOn.mockResolvedValue(true);
    expect(await service.isHoliday('2026-12-16T09:30:00Z')).toBe(true);
    expect(repo.existsOn).toHaveBeenCalledWith('2026-12-16');
  });
});
