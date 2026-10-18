import { Module } from '@nestjs/common';
import { AuthModule } from '@module/auth/auth.module';
import { RelationalUsersPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';
import { UsersController } from './controllers/users.controller';
import { UsersFacade } from './services/users.facade';
import { UsersService } from './services/users.service';

@Module({
  imports: [RelationalUsersPersistenceModule, AuthModule],
  controllers: [UsersController],
  providers: [UsersFacade, UsersService],
  exports: [UsersService],
})
export class UsersModule {}
