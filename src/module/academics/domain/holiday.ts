export enum HolidayKind {
  Government = 'government',
  Institution = 'institution',
}

/** A day with no classes; attendance cannot be marked on it. */
export interface Holiday {
  id: string;
  institutionId: string;
  date: string;
  nameBn: string;
  nameEn: string;
  kind: HolidayKind;
  createdAt: Date;
}

export interface NewHoliday {
  institutionId: string;
  date: string;
  nameBn: string;
  nameEn: string;
  kind: HolidayKind;
}
