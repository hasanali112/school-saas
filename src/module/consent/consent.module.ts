import { Module } from '@nestjs/common';
import { ConsentController } from './consent.controller';
import { ConsentRepository } from './consent.repository';
import { ConsentService } from './consent.service';

/** F1-15 (minimal): per-purpose guardian consent. The SMS audience joins the table directly. */
@Module({
  controllers: [ConsentController],
  providers: [ConsentService, ConsentRepository],
  exports: [ConsentService],
})
export class ConsentModule {}
