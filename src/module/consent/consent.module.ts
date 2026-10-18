import { Module } from '@nestjs/common';
import { RelationalConsentPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';
import { ConsentController } from './controllers/consent.controller';
import { ConsentFacade } from './services/consent.facade';
import { ConsentService } from './services/consent.service';

/** F1-15 (minimal): per-purpose guardian consent. The SMS audience reads the table directly. */
@Module({
  imports: [RelationalConsentPersistenceModule],
  controllers: [ConsentController],
  providers: [ConsentFacade, ConsentService],
  exports: [ConsentFacade],
})
export class ConsentModule {}
