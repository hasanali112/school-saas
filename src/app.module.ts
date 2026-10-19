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
import { DatabaseModule } from '@common/services/database/database.module';
import { TypeOrmConfigService } from '@common/services/database/typeorm.config.service';
import { appConfig } from '@config/app/app.config';
import { authConfig } from '@config/auth/auth.config';
import { databaseConfig } from '@config/database/database.config';
import { httpConfig } from '@config/http/http.config';
import { smsConfig } from '@config/sms/sms.config';
import { AcademicsModule } from '@module/academics/academics.module';
import { AuditModule } from '@module/audit/audit.module';
import { EventsModule } from '@module/events/events.module';
import { TimeModule } from '@module/time/time.module';
import { SmsModule } from '@module/sms/sms.module';
import { ConsentModule } from '@module/consent/consent.module';
import { LeaveModule } from '@module/leave/leave.module';
import { AttendanceModule } from '@module/attendance/attendance.module';
import { StudentsModule } from '@module/students/students.module';
import { UsersModule } from '@module/users/users.module';
import { InstitutionsModule } from '@module/institutions/institutions.module';
import { HealthModule } from '@module/health/health.module';
import { AuthModule } from '@module/auth/auth.module';
import { AuthGuard } from '@common/guards/auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';

const ONE_MINUTE_MS = 60_000;
/** Per-IP requests per minute; credential and callback routes set their own. */
const DEFAULT_RATE_LIMIT = 300;

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      envFilePath: ['.env.local', '.env'],
      load: [appConfig, databaseConfig, authConfig, httpConfig, smsConfig],
    }),
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService,
    }),
    ThrottlerModule.forRoot([
      { ttl: ONE_MINUTE_MS, limit: DEFAULT_RATE_LIMIT },
    ]),
    DatabaseModule,
    TimeModule,
    EventsModule,
    AuditModule,
    AuthModule,
    HealthModule,
    InstitutionsModule,
    AcademicsModule,
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
