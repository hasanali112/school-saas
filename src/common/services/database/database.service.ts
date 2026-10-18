import { Inject, Injectable } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { DataSource, EntityManager } from 'typeorm';
import { databaseConfig } from '@config/database/database.config';
import { currentInstitutionId } from './tenant-context';

export type TransactionWork<T> = (manager: EntityManager) => Promise<T>;

/**
 * The only way repositories reach the database. Every call is one transaction:
 * `tenant()` scopes it to the current institution through row-level security,
 * `system()` switches to the BYPASSRLS role for pre-auth and provider callbacks.
 */
@Injectable()
export class DatabaseService {
  private readonly systemRole: string;

  constructor(
    private readonly dataSource: DataSource,
    @Inject(databaseConfig.KEY) database: ConfigType<typeof databaseConfig>,
  ) {
    this.systemRole = database.systemRole;
  }

  tenant<T>(work: TransactionWork<T>): Promise<T> {
    const institutionId = currentInstitutionId();
    return this.dataSource.transaction(async (manager) => {
      await manager.query(`SELECT set_config('app.institution_id', $1, true)`, [
        institutionId,
      ]);
      return work(manager);
    });
  }

  system<T>(work: TransactionWork<T>): Promise<T> {
    return this.dataSource.transaction(async (manager) => {
      // The role name is validated by databaseConfig, so it is safe to inline.
      await manager.query(`SET LOCAL ROLE "${this.systemRole}"`);
      return work(manager);
    });
  }
}
