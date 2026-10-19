import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { Public } from '@common/decorators/public.decorator';
import type { AuthUser } from '@common/types/auth-user';
import {
  AuthUserDto,
  OtpRequestedDto,
  TokenResponseDto,
} from '../dto/auth.response.dto';
import { LoginDto } from '../dto/login.dto';
import { RequestOtpDto } from '../dto/request-otp.dto';
import { VerifyOtpDto } from '../dto/verify-otp.dto';
import { AuthFacade } from '../services/auth.facade';

const ONE_MINUTE_MS = 60_000;
/** Tight per-IP budget on credential endpoints; the global limit still applies elsewhere. */
const AUTH_THROTTLE = { default: { limit: 10, ttl: ONE_MINUTE_MS } };

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthFacade) {}

  @Public()
  @Throttle(AUTH_THROTTLE)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto): Promise<TokenResponseDto> {
    return this.auth.login(dto);
  }

  @Public()
  @Throttle(AUTH_THROTTLE)
  @Post('otp/request')
  @HttpCode(HttpStatus.OK)
  requestOtp(@Body() dto: RequestOtpDto): Promise<OtpRequestedDto> {
    return this.auth.requestOtp(dto);
  }

  @Public()
  @Throttle(AUTH_THROTTLE)
  @Post('otp/verify')
  @HttpCode(HttpStatus.OK)
  verifyOtp(@Body() dto: VerifyOtpDto): Promise<TokenResponseDto> {
    return this.auth.verifyOtp(dto);
  }

  @Get('me')
  me(@CurrentUser() user: AuthUser): Promise<AuthUserDto> {
    return this.auth.me(user);
  }
}
