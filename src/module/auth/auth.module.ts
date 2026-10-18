import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { authConfig } from '@config/auth/auth.config';
import { SmsModule } from '@module/sms/sms.module';
import { RelationalAuthPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';
import { JwtTokenSigner } from './infrastructure/adapters/jwt.token-signer';
import { ScryptPasswordHasher } from './infrastructure/adapters/scrypt.password-hasher';
import { SmsOtpSender } from './infrastructure/adapters/sms.otp-sender';
import { AuthController } from './controllers/auth.controller';
import { TOKEN_TTL_SECONDS } from './domain/auth.constants';
import { JwtAuthMiddleware } from './middleware/jwt-auth.middleware';
import { OtpSenderPort } from './application/ports/otp-sender.port';
import { PasswordHasherPort } from './application/ports/password-hasher.port';
import { TokenSignerPort } from './application/ports/token-signer.port';
import { AuthFacade } from './services/auth.facade';
import { AuthService } from './services/auth.service';

@Module({
  imports: [
    RelationalAuthPersistenceModule,
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
