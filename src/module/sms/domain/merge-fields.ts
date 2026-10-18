/**
 * Every merge field the audience builder or the composer can fill. Templates may
 * only reference these, so a saved template never fails to render at send time.
 */
export const MERGE_FIELDS = {
  studentName: 'Student name (Bangla)',
  studentNameEn: 'Student name (English)',
  guardianName: 'Guardian name',
  className: 'Class',
  sectionName: 'Section',
  rollNo: 'Roll number',
  name: 'Staff member name',
  date: 'Date (YYYY-MM-DD)',
  institutionName: 'Institution name',
} as const;

export type MergeField = keyof typeof MERGE_FIELDS;

const KNOWN = new Set<string>(Object.keys(MERGE_FIELDS));
export const isKnownMergeField = (field: string): boolean => KNOWN.has(field);
