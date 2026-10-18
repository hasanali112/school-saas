import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConsentRepository } from '../../../application/ports/consent.repository.port';
import { ConsentEntity } from './entities/consent.entity';
import { ConsentRelationalRepository } from './repositories/consent.repository';

/** TypeORM side of the consent module: its entities, and each repository port bound to its relational adapter. */
@Module({
  imports: [TypeOrmModule.forFeature([ConsentEntity])],
  providers: [
    { provide: ConsentRepository, useClass: ConsentRelationalRepository },
  ],
  exports: [ConsentRepository],
})
export class RelationalConsentPersistenceModule {}
