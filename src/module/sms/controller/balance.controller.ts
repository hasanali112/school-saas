import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { CurrentUser } from '@module/auth/decorators/current-user.decorator';
import { Roles } from '@module/auth/decorators/roles.decorator';
import { PaginationQueryDto } from '@common/dto/pagination-query.dto';
import type { AuthUser } from '@module/auth/domain/auth-user';
import { TopUpDto } from '../dto/balance.dto';
import {
  BalanceResponseDto,
  LedgerEntryResponseDto,
} from '../dto/balance.response.dto';
import { SMS_BALANCE_MANAGERS, SMS_OPERATORS } from './sms-roles';
import { BalanceFacade } from '../service/balance.facade';

@Controller('sms/balance')
export class BalanceController {
  constructor(private readonly balance: BalanceFacade) {}

  @Get()
  @Roles(SMS_OPERATORS)
  get(): Promise<BalanceResponseDto> {
    return this.balance.get();
  }

  @Get('ledger')
  @Roles(SMS_OPERATORS)
  ledger(
    @Query() query: PaginationQueryDto,
  ): Promise<LedgerEntryResponseDto[]> {
    return this.balance.ledger(query.limit, query.offset);
  }

  /** Manual top-up until SMS packs arrive through billing (F1-01). */
  @Post('top-ups')
  @Roles(SMS_BALANCE_MANAGERS)
  topUp(
    @Body() dto: TopUpDto,
    @CurrentUser() actor: AuthUser,
  ): Promise<BalanceResponseDto> {
    return this.balance.topUp(dto, actor);
  }
}
