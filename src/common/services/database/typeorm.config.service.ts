import { Inject, Injectable } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { databaseConfig } from '@config/database/database.config';
import { SnakeNamingStrategy } from './snake-naming.strategy';

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  constructor(
    @Inject(databaseConfig.KEY)
    private readonly database: ConfigType<typeof databaseConfig>,
  ) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: 'postgres',
      url: this.database.url,
      autoLoadEntities: true,
      synchronize: false,
      logging: false,
      namingStrategy: new SnakeNamingStrategy(),
      extra: { options: '-c timezone=UTC' },
    };
  }
}
