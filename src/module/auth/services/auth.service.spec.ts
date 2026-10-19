import { UnauthorizedException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { authConfig } from '@config/auth/auth.config';
import { UserStatus } from '@module/users/domain/user';
import type { User } from '@module/users/domain/user';
import { createMock, getMock } from '@test/utils/create-mock';
import { OTP_MAX_ATTEMPTS } from '../domain/auth.constants';
import type { OtpCode } from '../domain/otp-code';
import { Role } from '@common/types/role';
import { AuthRepository } from '../application/ports/auth.repository.port';
import { OtpSenderPort } from '../application/ports/otp-sender.port';
import { PasswordHasherPort } from '../application/ports/password-hasher.port';
import { TokenSignerPort } from '../application/ports/token-signer.port';
import { AuthService } from './auth.service';

const INSTITUTION_ID = '11111111-1111-4111-8111-111111111111';
const user: User = {
  id: '33333333-3333-4333-8333-333333333333',
  institutionId: INSTITUTION_ID,
  phone: '01700000000',
  name: 'Head',
  passwordHash: 'scrypt$1$salt$hash',
  roles: [Role.InstituteHead],
  status: UserStatus.Active,
  createdAt: new Date('2026-01-01'),
};
const login = {
  institutionSlug: 'demo',
  phone: user.phone,
  password: 'Admin@12345',
};
const otpRequest = { institutionSlug: 'demo', phone: user.phone };

describe('AuthService', () => {
  let service: AuthService;
  let repo: jest.Mocked<AuthRepository>;
  let passwords: jest.Mocked<PasswordHasherPort>;
  let tokens: jest.Mocked<TokenSignerPort>;
  let sender: jest.Mocked<OtpSenderPort>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: authConfig.KEY,
          useValue: { jwtSecret: 'test-secret' },
        },
      ],
    })
      .useMocker(createMock)
      .compile();
    service = moduleRef.get(AuthService);
    repo = getMock(moduleRef, AuthRepository);
    passwords = getMock(moduleRef, PasswordHasherPort);
    tokens = getMock(moduleRef, TokenSignerPort);
    sender = getMock(moduleRef, OtpSenderPort);
    tokens.sign.mockReturnValue('signed-token');
  });

  describe('login', () => {
    it('issues a token carrying id, institution and roles', async () => {
      repo.findLoginUser.mockResolvedValue(user);
      passwords.verify.mockResolvedValue(true);

      const result = await service.login(login);

      expect(tokens.sign).toHaveBeenCalledWith({
        sub: user.id,
        institutionId: INSTITUTION_ID,
        roles: [Role.InstituteHead],
      });
      expect(result.accessToken).toBe('signed-token');
      expect(result.user).not.toHaveProperty('passwordHash');
    });

    it.each([
      ['unknown user', undefined, true],
      ['disabled user', { ...user, status: UserStatus.Disabled }, true],
      ['otp-only user', { ...user, passwordHash: null }, true],
      ['wrong password', user, false],
    ])('rejects %s with the same 401', async (_, found, verifies) => {
      repo.findLoginUser.mockResolvedValue(found);
      passwords.verify.mockResolvedValue(verifies);
      await expect(service.login(login)).rejects.toThrow(
        new UnauthorizedException('Invalid credentials'),
      );
    });
  });

  describe('requestOtp', () => {
    it('stores a hashed 6-digit code and sends the plain code', async () => {
      repo.findLoginUser.mockResolvedValue(user);

      const result = await service.requestOtp(otpRequest);

      const [userId, hash, expiresAt] = repo.replaceOtp.mock.calls[0];
      const [, sentCode] = sender.send.mock.calls[0];
      expect(userId).toBe(user.id);
      expect(hash).toMatch(/^[0-9a-f]{64}$/);
      expect(sentCode).toMatch(/^\d{6}$/);
      expect(expiresAt.getTime()).toBeGreaterThan(Date.now());
      expect(result.expiresInSeconds).toBe(300);
    });

    it('returns the same response for an unknown phone and sends nothing', async () => {
      repo.findLoginUser.mockResolvedValue(undefined);
      const result = await service.requestOtp(otpRequest);
      expect(result.expiresInSeconds).toBe(300);
      expect(sender.send).not.toHaveBeenCalled();
      expect(repo.replaceOtp).not.toHaveBeenCalled();
    });
  });

  describe('verifyOtp', () => {
    const otp: OtpCode = {
      id: 'otp-1',
      userId: user.id,
      codeHash: '',
      expiresAt: new Date(Date.now() + 60_000),
      attempts: 0,
      consumedAt: null,
      createdAt: new Date(),
    };

    async function issuedCodeHash(): Promise<{ code: string; hash: string }> {
      repo.findLoginUser.mockResolvedValue(user);
      await service.requestOtp(otpRequest);
      const [, hash] = repo.replaceOtp.mock.calls[0];
      const [, code] = sender.send.mock.calls[0];
      return { code, hash };
    }

    it('accepts the issued code once and consumes it', async () => {
      const { code, hash } = await issuedCodeHash();
      repo.findActiveOtp.mockResolvedValue({ ...otp, codeHash: hash });
      repo.recordAttempt.mockResolvedValue(1);

      const result = await service.verifyOtp({ ...otpRequest, code });

      expect(result.accessToken).toBe('signed-token');
      expect(repo.consumeOtp).toHaveBeenCalledWith('otp-1');
    });

    it('rejects a wrong code without consuming', async () => {
      const { hash } = await issuedCodeHash();
      repo.findActiveOtp.mockResolvedValue({ ...otp, codeHash: hash });
      repo.recordAttempt.mockResolvedValue(1);

      await expect(
        service.verifyOtp({ ...otpRequest, code: '000000' }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
      expect(repo.consumeOtp).not.toHaveBeenCalled();
    });

    it('rejects even the right code once attempts exceed the cap', async () => {
      const { code, hash } = await issuedCodeHash();
      repo.findActiveOtp.mockResolvedValue({ ...otp, codeHash: hash });
      repo.recordAttempt.mockResolvedValue(OTP_MAX_ATTEMPTS + 1);

      await expect(
        service.verifyOtp({ ...otpRequest, code }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('rejects when no active code exists', async () => {
      repo.findLoginUser.mockResolvedValue(user);
      repo.findActiveOtp.mockResolvedValue(undefined);
      await expect(
        service.verifyOtp({ ...otpRequest, code: '123456' }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
      expect(repo.recordAttempt).not.toHaveBeenCalled();
    });
  });

  describe('authenticate', () => {
    it('maps a verified token to the principal and rejects anything else', () => {
      tokens.verify.mockReturnValueOnce({
        sub: user.id,
        institutionId: INSTITUTION_ID,
        roles: [Role.InstituteHead],
      });
      expect(service.authenticate('good')).toEqual({
        id: user.id,
        institutionId: INSTITUTION_ID,
        roles: [Role.InstituteHead],
      });
      tokens.verify.mockReturnValueOnce(undefined);
      expect(service.authenticate('bad')).toBeUndefined();
    });
  });
});
