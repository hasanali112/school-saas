import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { SnakeNamingStrategy } from '../common/services/database/snake-naming.strategy';

/**
 * Standalone DataSource for the TypeORM CLI (`yarn migration:*`). Nest itself boots
 * through `TypeOrmModule.forRootAsync` + `TypeOrmConfigService`; keep the two in step.
 * Migrations run as the owner role, so they bypass RLS by owning the tables.
 */
export default new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  namingStrategy: new SnakeNamingStrategy(),
  entities: [`${__dirname}/../module/**/*.entity{.ts,.js}`],
  migrations: [`${__dirname}/migrations/*{.ts,.js}`],
  migrationsTableName: 'typeorm_migrations',
  synchronize: false,
  logging: ['error', 'migration'],
  extra: { options: '-c timezone=UTC' },
});
