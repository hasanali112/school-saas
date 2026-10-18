/** Merge-field syntax is `{{field}}`; values are plain strings, never HTML. */
const FIELD_PATTERN = /\{\{\s*([A-Za-z][A-Za-z0-9_]*)\s*\}\}/g;

/** Field name → rendered value; the audience builder and composer fill these. */
export interface MergeValues {
  [field: string]: string;
}

/** Unique field names in order of first appearance. */
export function extractMergeFields(template: string): string[] {
  const seen = new Set<string>();
  for (const match of template.matchAll(FIELD_PATTERN)) seen.add(match[1]);
  return [...seen];
}

export class MissingMergeFieldsError extends Error {
  constructor(readonly fields: readonly string[]) {
    super(`Missing merge fields: ${fields.join(', ')}`);
    this.name = 'MissingMergeFieldsError';
  }
}

/** Fills every placeholder; throws (listing all of them) rather than sending a message with holes. */
export function renderTemplate(template: string, values: MergeValues): string {
  const missing = extractMergeFields(template).filter(
    (field) => values[field] === undefined,
  );
  if (missing.length) throw new MissingMergeFieldsError(missing);
  return template.replace(FIELD_PATTERN, (_, field: string) => values[field]);
}
