import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InstitutionsRepository } from '../../../application/ports/institutions.repository.port';
import { InstitutionEntity } from './entities/institution.entity';
import { InstitutionsRelationalRepository } from './repositories/institutions.repository';

/** TypeORM side of the institutions module: its entities, and each repository port bound to its relational adapter. */
@Module({
  imports: [TypeOrmModule.forFeature([InstitutionEntity])],
  providers: [
    {
      provide: InstitutionsRepository,
      useClass: InstitutionsRelationalRepository,
    },
  ],
  exports: [InstitutionsRepository],
})
export class RelationalInstitutionsPersistenceModule {}
