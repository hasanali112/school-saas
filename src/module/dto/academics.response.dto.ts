import {
  AcademicSessionRow,
  ClassRow,
  SectionRow,
  ShiftRow,
} from '@database/schema';

export class SessionResponseDto {
  readonly id: string;
  readonly name: string;
  readonly startsOn: string;
  readonly endsOn: string;
  readonly isCurrent: boolean;

  private constructor(row: AcademicSessionRow) {
    this.id = row.id;
    this.name = row.name;
    this.startsOn = row.startsOn;
    this.endsOn = row.endsOn;
    this.isCurrent = row.isCurrent;
  }

  static from(row: AcademicSessionRow): SessionResponseDto {
    return new SessionResponseDto(row);
  }

  static fromMany(rows: readonly AcademicSessionRow[]): SessionResponseDto[] {
    return rows.map((row) => SessionResponseDto.from(row));
  }
}

export class ShiftResponseDto {
  readonly id: string;
  readonly name: string;

  private constructor(row: ShiftRow) {
    this.id = row.id;
    this.name = row.name;
  }

  static from(row: ShiftRow): ShiftResponseDto {
    return new ShiftResponseDto(row);
  }

  static fromMany(rows: readonly ShiftRow[]): ShiftResponseDto[] {
    return rows.map((row) => ShiftResponseDto.from(row));
  }
}

export class SectionResponseDto {
  readonly id: string;
  readonly classId: string;
  readonly shiftId: string | null;
  readonly name: string;

  private constructor(row: SectionRow) {
    this.id = row.id;
    this.classId = row.classId;
    this.shiftId = row.shiftId;
    this.name = row.name;
  }

  static from(row: SectionRow): SectionResponseDto {
    return new SectionResponseDto(row);
  }
}

export class ClassResponseDto {
  readonly id: string;
  readonly name: string;
  readonly ordinal: number;
  readonly sections: SectionResponseDto[];

  private constructor(row: ClassRow, sections: readonly SectionRow[]) {
    this.id = row.id;
    this.name = row.name;
    this.ordinal = row.ordinal;
    this.sections = sections.map((s) => SectionResponseDto.from(s));
  }

  static from(
    row: ClassRow,
    sections: readonly SectionRow[] = [],
  ): ClassResponseDto {
    return new ClassResponseDto(row, sections);
  }

  /** Groups sections by class in one pass; avoids an N+1 and avoids nested loops. */
  static fromMany(
    rows: readonly ClassRow[],
    sections: readonly SectionRow[],
  ): ClassResponseDto[] {
    const byClass = new Map<string, SectionRow[]>();
    for (const section of sections) {
      const bucket = byClass.get(section.classId);
      if (bucket) bucket.push(section);
      else byClass.set(section.classId, [section]);
    }
    return rows.map((row) =>
      ClassResponseDto.from(row, byClass.get(row.id) ?? []),
    );
  }
}
