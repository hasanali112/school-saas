import { Injectable } from '@nestjs/common';
import type { AuthUser } from '@module/auth/domain/auth-user';
import { ImportOptions, ImportOutcome, ImportService } from './import.service';

@Injectable()
export class ImportFacade {
  constructor(private readonly imports: ImportService) {}

  template(): Promise<Buffer> {
    return this.imports.template();
  }

  import(
    buffer: Buffer,
    options: ImportOptions,
    actor: AuthUser,
    wantErrorFile: boolean,
  ): Promise<ImportOutcome> {
    return this.imports.import(buffer, options, actor, wantErrorFile);
  }
}
