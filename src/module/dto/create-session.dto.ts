import {
  IsBoolean,
  IsISO8601,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

export class CreateSessionDto {
  /** e.g. "2027" or "2027-28". */
  @IsString()
  @Length(2, 40)
  name: string;

  @IsISO8601({ strict: true })
  startsOn: string;

  @IsISO8601({ strict: true })
  endsOn: string;

  @IsOptional()
  @IsBoolean()
  isCurrent?: boolean;
}
