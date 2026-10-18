import type { AcademicSession } from '../domain/academic-session';
import type { SchoolClass, Section } from '../domain/school-class';
import type { Shift } from '../domain/shift';

export class SessionResponseDto {
  readonly id: string;
  readonly name: string;
  readonly startsOn: string;
  readonly endsOn: string;
  readonly isCurrent: boolean;

  private constructor(session: AcademicSession) {
    this.id = session.id;
    this.name = session.name;
    this.startsOn = session.startsOn;
    this.endsOn = session.endsOn;
    this.isCurrent = session.isCurrent;
  }

  static from(session: AcademicSession): SessionResponseDto {
    return new SessionResponseDto(session);
  }

  static fromMany(sessions: readonly AcademicSession[]): SessionResponseDto[] {
    return sessions.map((session) => SessionResponseDto.from(session));
  }
}

export class ShiftResponseDto {
  readonly id: string;
  readonly name: string;

  private constructor(shift: Shift) {
    this.id = shift.id;
    this.name = shift.name;
  }

  static from(shift: Shift): ShiftResponseDto {
    return new ShiftResponseDto(shift);
  }

  static fromMany(shifts: readonly Shift[]): ShiftResponseDto[] {
    return shifts.map((shift) => ShiftResponseDto.from(shift));
  }
}

export class SectionResponseDto {
  readonly id: string;
  readonly classId: string;
  readonly shiftId: string | null;
  readonly name: string;

  private constructor(section: Section) {
    this.id = section.id;
    this.classId = section.classId;
    this.shiftId = section.shiftId;
    this.name = section.name;
  }

  static from(section: Section): SectionResponseDto {
    return new SectionResponseDto(section);
  }
}

export class ClassResponseDto {
  readonly id: string;
  readonly name: string;
  readonly ordinal: number;
  readonly sections: SectionResponseDto[];

  private constructor(schoolClass: SchoolClass, sections: readonly Section[]) {
    this.id = schoolClass.id;
    this.name = schoolClass.name;
    this.ordinal = schoolClass.ordinal;
    this.sections = sections.map((s) => SectionResponseDto.from(s));
  }

  static from(
    schoolClass: SchoolClass,
    sections: readonly Section[] = [],
  ): ClassResponseDto {
    return new ClassResponseDto(schoolClass, sections);
  }

  /** Groups sections by class in one pass; avoids an N+1 and avoids nested loops. */
  static fromMany(
    classes: readonly SchoolClass[],
    sections: readonly Section[],
  ): ClassResponseDto[] {
    const byClass = new Map<string, Section[]>();
    for (const section of sections) {
      const bucket = byClass.get(section.classId);
      if (bucket) bucket.push(section);
      else byClass.set(section.classId, [section]);
    }
    return classes.map((c) =>
      ClassResponseDto.from(c, byClass.get(c.id) ?? []),
    );
  }
}
