import { Transform } from 'class-transformer';
import type { TransformFnParams } from 'class-transformer';
import { IsBoolean, IsOptional, IsUUID } from 'class-validator';

/** The raw query object class-transformer hands to `@Transform`. */
interface RawQuery {
  [key: string]: unknown;
}

/**
 * Reads the raw query value, not the converted one: with implicit conversion enabled,
 * Boolean('false') is true, so `value` would already be wrong by the time we see it.
 */
const toBool = ({ obj, key }: TransformFnParams): boolean => {
  const raw = (obj as RawQuery)[key];
  return raw === true || raw === 'true' || raw === '1';
};

export class ImportQueryDto {
  @IsOptional()
  @Transform(toBool)
  @IsBoolean()
  dryRun: boolean = true;

  /** Return the error workbook (xlsx) instead of JSON when there are errors. */
  @IsOptional()
  @Transform(toBool)
  @IsBoolean()
  errorFile: boolean = false;

  @IsOptional()
  @IsUUID()
  sessionId?: string;
}
