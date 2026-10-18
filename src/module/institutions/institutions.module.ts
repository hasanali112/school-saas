import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InstitutionsController } from './controller/institutions.controller';
import { InstitutionsRepositoryPort } from './port/institutions.repository.port';
import { InstitutionEntity } from './repository/entities/institution.entity';
import { InstitutionsRepository } from './repository/institutions.repository';
import { InstitutionsFacade } from './service/institutions.facade';
import { InstitutionsService } from './service/institutions.service';

@Module({
  imports: [TypeOrmModule.forFeature([InstitutionEntity])],
  controllers: [InstitutionsController],
  providers: [
    InstitutionsFacade,
    InstitutionsService,
    { provide: InstitutionsRepositoryPort, useClass: InstitutionsRepository },
  ],
  exports: [InstitutionsFacade],
})
export class InstitutionsModule {}
