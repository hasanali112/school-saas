import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AuthUser } from '@common/types/auth-user';
import { Role } from '@common/types/role';
import type { SmsTemplate } from '../domain/sms-template';
import { createMock, getMock } from '@test/utils/create-mock';
import { DEFAULT_TEMPLATES } from '../domain/default-templates';
import { TemplatesRepository } from '../application/ports/templates.repository.port';
import { TemplatesService } from './templates.service';

const actor: AuthUser = {
  id: 'admin',
  institutionId: 'inst-1',
  roles: [Role.AdminOfficer],
};
const row = (overrides: Partial<SmsTemplate> = {}): SmsTemplate => ({
  id: 't1',
  institutionId: 'inst-1',
  key: 'absence',
  name: 'Absence',
  body: 'Custom {{studentName}}',
  updatedBy: 'admin',
  createdAt: new Date('2026-09-01'),
  updatedAt: new Date('2026-09-01'),
  ...overrides,
});

describe('TemplatesService', () => {
  let service: TemplatesService;
  let repo: jest.Mocked<TemplatesRepository>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [TemplatesService],
    })
      .useMocker(createMock)
      .compile();
    service = moduleRef.get(TemplatesService);
    repo = getMock(moduleRef, TemplatesRepository);
  });

  it('resolves the institution override before the built-in default', async () => {
    repo.findByKey.mockResolvedValue(row());
    await expect(service.resolve('absence')).resolves.toBe(
      'Custom {{studentName}}',
    );
  });

  it('falls back to the built-in template when the institution has none', async () => {
    repo.findByKey.mockResolvedValue(undefined);
    await expect(service.resolve('absence')).resolves.toBe(
      DEFAULT_TEMPLATES.absence.body,
    );
  });

  it('404s for a key that is neither custom nor built in', async () => {
    repo.findByKey.mockResolvedValue(undefined);
    await expect(service.resolve('nope')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('lists built-ins merged with overrides, flagging which are customised', async () => {
    repo.findAll.mockResolvedValue([row()]);
    const list = await service.list();
    const absence = list.find((t) => t.key === 'absence');
    expect(absence).toMatchObject({
      body: 'Custom {{studentName}}',
      isCustom: true,
    });
    expect(list.filter((t) => !t.isCustom).length).toBe(
      Object.keys(DEFAULT_TEMPLATES).length - 1,
    );
  });

  it('rejects a template that uses a merge field nobody can fill', async () => {
    await expect(
      service.upsert('absence', { name: 'x', body: 'Hi {{nickname}}' }, actor),
    ).rejects.toThrow(BadRequestException);
    expect(repo.upsert).not.toHaveBeenCalled();
  });

  it('saves a valid template and echoes its merge fields', async () => {
    repo.upsert.mockResolvedValue(row({ body: 'Hi {{guardianName}}' }));
    const saved = await service.upsert(
      'absence',
      { name: 'Absence', body: 'Hi {{guardianName}}' },
      actor,
    );
    expect(repo.upsert).toHaveBeenCalledWith({
      institutionId: 'inst-1',
      key: 'absence',
      name: 'Absence',
      body: 'Hi {{guardianName}}',
      updatedBy: 'admin',
    });
    expect(saved).toMatchObject({
      mergeFields: ['guardianName'],
      isCustom: true,
    });
  });
});
