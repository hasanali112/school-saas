import { Test } from '@nestjs/testing';
import { PasswordService } from './password.service';

describe('PasswordService', () => {
  let service: PasswordService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [PasswordService],
    }).compile();
    service = moduleRef.get(PasswordService);
  });

  it('hashes with a random salt and verifies the original', async () => {
    const stored = await service.hash('Admin@12345');
    expect(stored.startsWith('scrypt$')).toBe(true);
    expect(await service.verify('Admin@12345', stored)).toBe(true);
    expect(await service.verify('Admin@12346', stored)).toBe(false);
  });

  it('produces different hashes for the same password', async () => {
    const [a, b] = await Promise.all([service.hash('x'), service.hash('x')]);
    expect(a).not.toBe(b);
  });

  it('rejects malformed stored values instead of throwing', async () => {
    expect(await service.verify('x', 'not-a-hash')).toBe(false);
    expect(await service.verify('x', 'bcrypt$1$salt$abcd')).toBe(false);
  });
});
