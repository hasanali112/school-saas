import {
  MiddlewareConsumer,
  Module,
  NestModule,
  ValidationPipe,
} from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_PIPE } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AllExceptionsFilter } from '@common/filters/all-exceptions.filter';
import { LoggerMiddleware } from '@common/middleware/logger.middleware';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmConfigService } from '@common/services/database/typeorm.config.service';
import { appConfig } from '@config/app/app.config';
import { authConfig } from '@config/auth/auth.config';
import { databaseConfig } from '@config/database/database.config';
import { httpConfig } from '@config/http/http.config';
import { smsConfig } from '@config/sms/sms.config';
import { SmsModule } from '@module/sms/sms.module';
import { ConsentModule } from '@module/consent/consent.module';
import { LeaveModule } from '@module/leave/leave.module';
import { AttendanceModule } from '@module/attendance/attendance.module';
import { StudentsModule } from '@module/students/students.module';
import { UsersModule } from '@module/users/users.module';
import { InstitutionsModule } from '@module/institutions/institutions.module';
import { HealthModule } from '@module/health/health.module';
import { AuthModule } from '@module/auth/auth.module';
import { AuthGuard } from '@module/auth/guards/auth.guard';
import { RolesGuard } from '@module/auth/guards/roles.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      envFilePath: ['.env'],
      load: [appConfig, databaseConfig, authConfig, httpConfig, smsConfig],
    }),
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService,
    }),
    AuthModule,
    HealthModule,
    InstitutionsModule,
    UsersModule,
    StudentsModule,
    AttendanceModule,
    LeaveModule,
    ConsentModule,
    SmsModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(LoggerMiddleware).forRoutes('*path');
  }
}
