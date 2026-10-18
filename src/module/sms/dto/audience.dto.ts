import {
  ArrayMaxSize,
  ArrayUnique,
  IsArray,
  IsEnum,
  IsOptional,
  IsUUID,
  Matches,
} from 'class-validator';
import { Role } from '@modules/auth/roles';
import { BD_PHONE_REGEX } from '@common/utils/phone/phone';

/** One batch tops out at a whole institution; bigger sends are split by the caller. */
const MAX_EXPLICIT_RECIPIENTS = 2000;

/** Any combination; guardians come from class/section/students, staff from roles, plus ad-hoc phones. */
export class AudienceDto {
  @IsOptional()
  @IsUUID()
  classId?: string;

  @IsOptional()
  @IsUUID()
  sectionId?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(MAX_EXPLICIT_RECIPIENTS)
  @ArrayUnique()
  @IsUUID('all', { each: true })
  studentIds?: string[];

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsEnum(Role, { each: true })
  roles?: Role[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(MAX_EXPLICIT_RECIPIENTS)
  @ArrayUnique()
  @Matches(BD_PHONE_REGEX, { each: true })
  phones?: string[];
}
