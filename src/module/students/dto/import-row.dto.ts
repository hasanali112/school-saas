import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Matches,
  Max,
  Min,
} from 'class-validator';
import { BD_PHONE_MESSAGE, BD_PHONE_REGEX } from '@common/utils/phone/phone';
import { GuardianRelation } from '../domain/guardian';
import { CreateStudentDto } from './create-student.dto';

const MAX_ROLL = 9999;

/**
 * One spreadsheet row: the student, where to enrol them, and an optional primary guardian.
 * Column headers in the template match these property names exactly.
 */
export class ImportRowDto extends CreateStudentDto {
  @IsString()
  @Length(1, 60)
  className: string;

  @IsString()
  @Length(1, 60)
  sectionName: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(MAX_ROLL)
  rollNo: number;

  @IsOptional()
  @IsString()
  @Length(1, 120)
  guardianName?: string;

  @IsOptional()
  @Matches(BD_PHONE_REGEX, { message: BD_PHONE_MESSAGE })
  guardianPhone?: string;

  @IsOptional()
  @IsEnum(GuardianRelation)
  guardianRelation?: GuardianRelation;
}
