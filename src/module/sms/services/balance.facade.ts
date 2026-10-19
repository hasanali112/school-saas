import { Injectable } from '@nestjs/common';
import type { AuthUser } from '@common/types/auth-user';
import { TopUpDto } from '../dto/balance.dto';
import {
  BalanceResponseDto,
  LedgerEntryResponseDto,
} from '../dto/balance.response.dto';
import { BalanceService } from './balance.service';

@Injectable()
export class BalanceFacade {
  constructor(private readonly balance: BalanceService) {}

  get(): Promise<BalanceResponseDto> {
    return this.balance.get();
  }

  ledger(limit: number, offset: number): Promise<LedgerEntryResponseDto[]> {
    return this.balance.ledger(limit, offset);
  }

  topUp(dto: TopUpDto, actor: AuthUser): Promise<BalanceResponseDto> {
    return this.balance.topUp(dto, actor);
  }
}
