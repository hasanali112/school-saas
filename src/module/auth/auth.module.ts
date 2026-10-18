import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { authConfig } from '@config/auth/auth.config';
import { SmsModule } from '@module/sms/sms.module';
import { JwtTokenSigner } from './adapter/jwt.token-signer';
import { ScryptPasswordHasher } from './adapter/scrypt.password-hasher';
import { SmsOtpSender } from './adapter/sms.otp-sender';
import { AuthController } from './controller/auth.controller';
import { TOKEN_TTL_SECONDS } from './domain/auth.constants';
import { JwtAuthMiddleware } from './middleware/jwt-auth.middleware';
import { AuthRepositoryPort } from './port/auth.repository.port';
import { OtpSenderPort } from './port/otp-sender.port';
import { PasswordHasherPort } from './port/password-hasher.port';
import { TokenSignerPort } from './port/token-signer.port';
import { OtpCodeEntity } from './repository/entities/otp-code.entity';
import { AuthRepository } from './repository/auth.repository';
import { AuthFacade } from './service/auth.facade';
import { AuthService } from './service/auth.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([OtpCodeEntity]),
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
    AuthFacade,
    AuthService,
    { provide: AuthRepositoryPort, useClass: AuthRepository },
    { provide: PasswordHasherPort, useClass: ScryptPasswordHasher },
    { provide: TokenSignerPort, useClass: JwtTokenSigner },
    { provide: OtpSenderPort, useClass: SmsOtpSender },
  ],
  exports: [AuthFacade],
})
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(JwtAuthMiddleware).forRoutes('*path');
  }
}
