import { ConsentRow } from '@database/schema';

export class ConsentResponseDto {
  readonly purpose: ConsentRow['purpose'];
  readonly granted: boolean;
  readonly noticeVersion: string;
  readonly source: ConsentRow['source'];
  readonly note: string | null;
  readonly updatedAt: Date;

  private constructor(row: ConsentRow) {
    this.purpose = row.purpose;
    this.granted = row.granted;
    this.noticeVersion = row.noticeVersion;
    this.source = row.source;
    this.note = row.note;
    this.updatedAt = row.updatedAt;
  }

  static from(row: ConsentRow): ConsentResponseDto {
    return new ConsentResponseDto(row);
  }

  static fromMany(rows: readonly ConsentRow[]): ConsentResponseDto[] {
    return rows.map((row) => ConsentResponseDto.from(row));
  }
}
