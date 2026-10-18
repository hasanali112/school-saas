import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthRepository } from '../../../application/ports/auth.repository.port';
import { OtpCodeEntity } from './entities/otp-code.entity';
import { AuthRelationalRepository } from './repositories/auth.repository';

/** TypeORM side of the auth module: its entities, and each repository port bound to its relational adapter. */
@Module({
  imports: [TypeOrmModule.forFeature([OtpCodeEntity])],
  providers: [{ provide: AuthRepository, useClass: AuthRelationalRepository }],
  exports: [AuthRepository],
})
export class RelationalAuthPersistenceModule {}
