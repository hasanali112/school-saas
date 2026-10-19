import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { createHmac, randomInt, timingSafeEqual } from 'node:crypto';
import { authConfig } from '@config/auth/auth.config';
import { UserStatus } from '@module/users/domain/user';
import type { User } from '@module/users/domain/user';
import {
  INVALID_CREDENTIALS,
  INVALID_OTP,
  OTP_LENGTH,
  OTP_MAX_ATTEMPTS,
  OTP_TTL_SECONDS,
  TOKEN_TTL_SECONDS,
} from '../domain/auth.constants';
import type { AuthUser } from '@common/types/auth-user';
import type { JwtPayload } from '../domain/jwt-payload';
import {
  AuthUserDto,
  OtpRequestedDto,
  TokenResponseDto,
} from '../dto/auth.response.dto';
import { LoginDto } from '../dto/login.dto';
import { RequestOtpDto } from '../dto/request-otp.dto';
import { VerifyOtpDto } from '../dto/verify-otp.dto';
import { AuthRepository } from '../application/ports/auth.repository.port';
import { OtpSenderPort } from '../application/ports/otp-sender.port';
import { PasswordHasherPort } from '../application/ports/password-hasher.port';
import { TokenSignerPort } from '../application/ports/token-signer.port';

const OTP_MAX_EXCLUSIVE = 10 ** OTP_LENGTH;

@Injectable()
export class AuthService {
  private readonly otpSecret: string;

  constructor(
    private readonly repo: AuthRepository,
    private readonly passwords: PasswordHasherPort,
    private readonly tokens: TokenSignerPort,
    private readonly otpSender: OtpSenderPort,
    @Inject(authConfig.KEY) auth: ConfigType<typeof authConfig>,
  ) {
    this.otpSecret = auth.jwtSecret;
  }

  async login(dto: LoginDto): Promise<TokenResponseDto> {
    const user = await this.repo.findLoginUser(dto.institutionSlug, dto.phone);
    const isValid =
      this.isActive(user) &&
      !!user.passwordHash &&
      (await this.passwords.verify(dto.password, user.passwordHash));
    if (!isValid) throw new UnauthorizedException(INVALID_CREDENTIALS);
    return this.issue(user);
  }

  /** Same response whether or not the phone exists, so accounts cannot be enumerated. */
  async requestOtp(dto: RequestOtpDto): Promise<OtpRequestedDto> {
    const user = await this.repo.findLoginUser(dto.institutionSlug, dto.phone);
    if (this.isActive(user)) {
      const code = randomInt(0, OTP_MAX_EXCLUSIVE)
        .toString()
        .padStart(OTP_LENGTH, '0');
      const expiresAt = new Date(Date.now() + OTP_TTL_SECONDS * 1000);
      await this.repo.replaceOtp(
        user.id,
        this.hashOtp(user.id, code),
        expiresAt,
      );
      await this.otpSender.send(user.phone, code);
    }
    return new OtpRequestedDto(OTP_TTL_SECONDS);
  }

  async verifyOtp(dto: VerifyOtpDto): Promise<TokenResponseDto> {
    const user = await this.repo.findLoginUser(dto.institutionSlug, dto.phone);
    if (!this.isActive(user)) throw new UnauthorizedException(INVALID_OTP);

    const otp = await this.repo.findActiveOtp(user.id);
    if (!otp) throw new UnauthorizedException(INVALID_OTP);

    // Count the attempt before comparing, so a burst of wrong guesses burns the code.
    const attempts = await this.repo.recordAttempt(otp.id);
    if (
      attempts > OTP_MAX_ATTEMPTS ||
      !this.matches(otp.codeHash, this.hashOtp(user.id, dto.code))
    ) {
      throw new UnauthorizedException(INVALID_OTP);
    }

    await this.repo.consumeOtp(otp.id);
    return this.issue(user);
  }

  async me(principal: AuthUser): Promise<AuthUserDto> {
    const user = await this.repo.findCurrentUser(principal.id);
    if (!user) throw new UnauthorizedException();
    return AuthUserDto.from(user);
  }

  /** The principal behind a bearer token, or undefined when the token is not valid. */
  authenticate(token: string): AuthUser | undefined {
    const payload = this.tokens.verify(token);
    if (!payload) return undefined;
    return {
      id: payload.sub,
      institutionId: payload.institutionId,
      roles: payload.roles,
    };
  }

  hashPassword(plain: string): Promise<string> {
    return this.passwords.hash(plain);
  }

  private issue(user: User): TokenResponseDto {
    const payload: JwtPayload = {
      sub: user.id,
      institutionId: user.institutionId,
      roles: user.roles,
    };
    return new TokenResponseDto(
      this.tokens.sign(payload),
      TOKEN_TTL_SECONDS,
      AuthUserDto.from(user),
    );
  }

  private hashOtp(userId: string, code: string): string {
    return createHmac('sha256', this.otpSecret)
      .update(`${userId}:${code}`)
      .digest('hex');
  }

  private matches(storedHex: string, candidateHex: string): boolean {
    const stored = Buffer.from(storedHex, 'hex');
    const candidate = Buffer.from(candidateHex, 'hex');
    return (
      stored.length === candidate.length && timingSafeEqual(stored, candidate)
    );
  }

  private isActive(user: User | undefined): user is User {
    return !!user && user.status === UserStatus.Active;
  }
}
