import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConsentController } from './controller/consent.controller';
import { ConsentRepositoryPort } from './port/consent.repository.port';
import { ConsentRepository } from './repository/consent.repository';
import { ConsentEntity } from './repository/entities/consent.entity';
import { ConsentFacade } from './service/consent.facade';
import { ConsentService } from './service/consent.service';

/** F1-15 (minimal): per-purpose guardian consent. The SMS audience reads the table directly. */
@Module({
  imports: [TypeOrmModule.forFeature([ConsentEntity])],
  controllers: [ConsentController],
  providers: [
    ConsentFacade,
    ConsentService,
    { provide: ConsentRepositoryPort, useClass: ConsentRepository },
  ],
  exports: [ConsentFacade],
})
export class ConsentModule {}
