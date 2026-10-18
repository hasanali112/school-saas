import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersRepository } from '../../../application/ports/users.repository.port';
import { UserEntity } from './entities/user.entity';
import { UsersRelationalRepository } from './repositories/users.repository';

/** TypeORM side of the users module: its entities, and each repository port bound to its relational adapter. */
@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
  providers: [
    { provide: UsersRepository, useClass: UsersRelationalRepository },
  ],
  exports: [UsersRepository],
})
export class RelationalUsersPersistenceModule {}
