import { ConsentPurpose, ConsentSource } from '../domain/consent';
import type { Consent } from '../domain/consent';

export class ConsentResponseDto {
  readonly purpose: ConsentPurpose;
  readonly granted: boolean;
  readonly noticeVersion: string;
  readonly source: ConsentSource;
  readonly note: string | null;
  readonly updatedAt: Date;

  private constructor(row: Consent) {
    this.purpose = row.purpose;
    this.granted = row.granted;
    this.noticeVersion = row.noticeVersion;
    this.source = row.source;
    this.note = row.note;
    this.updatedAt = row.updatedAt;
  }

  static from(row: Consent): ConsentResponseDto {
    return new ConsentResponseDto(row);
  }

  static fromMany(rows: readonly Consent[]): ConsentResponseDto[] {
    return rows.map((row) => ConsentResponseDto.from(row));
  }
}
