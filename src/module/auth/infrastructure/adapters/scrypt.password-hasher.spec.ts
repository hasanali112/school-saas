import { Test } from '@nestjs/testing';
import { ScryptPasswordHasher } from './scrypt.password-hasher';

describe('ScryptPasswordHasher', () => {
  let hasher: ScryptPasswordHasher;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [ScryptPasswordHasher],
    }).compile();
    hasher = moduleRef.get(ScryptPasswordHasher);
  });

  it('hashes with a random salt and verifies the original', async () => {
    const stored = await hasher.hash('Admin@12345');
    expect(stored.startsWith('scrypt$')).toBe(true);
    expect(await hasher.verify('Admin@12345', stored)).toBe(true);
    expect(await hasher.verify('Admin@12346', stored)).toBe(false);
  });

  it('produces different hashes for the same password', async () => {
    const [a, b] = await Promise.all([hasher.hash('x'), hasher.hash('x')]);
    expect(a).not.toBe(b);
  });

  it('rejects malformed stored values instead of throwing', async () => {
    expect(await hasher.verify('x', 'not-a-hash')).toBe(false);
    expect(await hasher.verify('x', 'bcrypt$1$salt$abcd')).toBe(false);
  });
});
