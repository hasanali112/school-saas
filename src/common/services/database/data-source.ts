import 'reflect-metadata';
import { DataSource, DataSourceOptions } from 'typeorm';

/**
 * Standalone DataSource used by the TypeORM CLI (migrations, schema:sync).
 * NestJS itself boots through `TypeOrmModule.forRootAsync` + the
 * `TypeOrmConfigService` — keep this file's options in sync with that service.
 */
export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.PG_HOST,
  port: process.env.PG_PORT ? parseInt(process.env.PG_PORT, 10) : 5432,
  username: process.env.PG_USER,
  password: process.env.PG_PASS,
  database: process.env.PG_DB,
  synchronize: process.env.PG_SYNCHRONIZE === 'true',
  dropSchema: false,
  keepConnectionAlive: true,
  logging: process.env.NODE_ENV !== 'production',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
  migrationsTableName: 'typeorm_migrations',
  extra: {
    max: process.env.PG_POOL_MAX ? parseInt(process.env.PG_POOL_MAX, 10) : 100,
    min: process.env.PG_POOL_MIN ? parseInt(process.env.PG_POOL_MIN, 10) : 0,
    idleTimeoutMillis: process.env.PG_POOL_IDLE
      ? parseInt(process.env.PG_POOL_IDLE, 10)
      : 10000,
    connectionTimeoutMillis: process.env.PG_POOL_ACQUIRE
      ? parseInt(process.env.PG_POOL_ACQUIRE, 10)
      : 30000,
    options: '-c timezone=UTC',
    ssl:
      process.env.PG_SSL === 'true'
        ? {
            rejectUnauthorized: false,
          }
        : undefined,
  },
} as DataSourceOptions);
