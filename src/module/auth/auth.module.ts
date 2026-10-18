import { Module } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { authConfig } from '@config/auth/auth.config';
import { SmsModule } from '@modules/sms/sms.module';
import { TOKEN_TTL_SECONDS } from './auth.constants';
import { AuthController } from './auth.controller';
import { AuthRepository } from './auth.repository';
import { AuthService } from './auth.service';
import { OTP_SENDER, SmsOtpSender } from './otp.sender';
import { PasswordService } from './password.service';

@Module({
  imports: [
    SmsModule,
    JwtModule.registerAsync({
      inject: [authConfig.KEY],
      useFactory: (auth: ConfigType<typeof authConfig>) => ({
        secret: auth.jwtSecret,
        signOptions: { expiresIn: TOKEN_TTL_SECONDS },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    AuthRepository,
    PasswordService,
    { provide: OTP_SENDER, useClass: SmsOtpSender },
  ],
  exports: [JwtModule, PasswordService],
})
export class AuthModule {}
