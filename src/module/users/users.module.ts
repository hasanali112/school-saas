import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '@module/auth/auth.module';
import { UsersController } from './controller/users.controller';
import { UsersRepositoryPort } from './port/users.repository.port';
import { UserEntity } from './repository/entities/user.entity';
import { UsersRepository } from './repository/users.repository';
import { UsersFacade } from './service/users.facade';
import { UsersService } from './service/users.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity]), AuthModule],
  controllers: [UsersController],
  providers: [
    UsersFacade,
    UsersService,
    { provide: UsersRepositoryPort, useClass: UsersRepository },
  ],
  exports: [UsersFacade],
})
export class UsersModule {}
