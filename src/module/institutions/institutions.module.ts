import { Module } from '@nestjs/common';
import { RelationalInstitutionsPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';
import { InstitutionsController } from './controllers/institutions.controller';
import { InstitutionsFacade } from './services/institutions.facade';
import { InstitutionsService } from './services/institutions.service';

@Module({
  imports: [RelationalInstitutionsPersistenceModule],
  controllers: [InstitutionsController],
  providers: [InstitutionsFacade, InstitutionsService],
  exports: [InstitutionsService],
})
export class InstitutionsModule {}
