import {
  Check,
  Column,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import type { SmsBalance } from '../../domain/sms-balance';

@Entity('sms_balances')
@Check('sms_balances_non_negative_ck', `balance_paisa >= 0`)
export class SmsBalanceEntity implements SmsBalance {
  @PrimaryColumn({ type: 'uuid' })
  institutionId: string;

  @Column({ type: 'integer', default: 0 })
  balancePaisa: number;

  @Column({ type: 'integer', nullable: true })
  ratePaisaPerSegment: number | null;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
