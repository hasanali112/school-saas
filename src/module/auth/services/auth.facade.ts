import { Injectable } from '@nestjs/common';
import type { AuthUser } from '../domain/auth-user';
import {
  AuthUserDto,
  OtpRequestedDto,
  TokenResponseDto,
} from '../dto/auth.response.dto';
import { LoginDto } from '../dto/login.dto';
import { RequestOtpDto } from '../dto/request-otp.dto';
import { VerifyOtpDto } from '../dto/verify-otp.dto';
import { AuthService } from './auth.service';

/** Connects the auth controller and the auth middleware to AuthService. */
@Injectable()
export class AuthFacade {
  constructor(private readonly auth: AuthService) {}

  login(dto: LoginDto): Promise<TokenResponseDto> {
    return this.auth.login(dto);
  }

  requestOtp(dto: RequestOtpDto): Promise<OtpRequestedDto> {
    return this.auth.requestOtp(dto);
  }

  verifyOtp(dto: VerifyOtpDto): Promise<TokenResponseDto> {
    return this.auth.verifyOtp(dto);
  }

  me(principal: AuthUser): Promise<AuthUserDto> {
    return this.auth.me(principal);
  }

  authenticate(token: string): AuthUser | undefined {
    return this.auth.authenticate(token);
  }
}
