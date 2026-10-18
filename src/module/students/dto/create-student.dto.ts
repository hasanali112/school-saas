import {
  IsEnum,
  IsISO8601,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';
import { Religion } from '@module/academics/domain/subject';
import { BloodGroup, Gender } from '../domain/student';

const NAME_MIN = 1;
const NAME_MAX = 120;
const ADDRESS_MAX = 500;

export class CreateStudentDto {
  @IsString()
  @Matches(/^[A-Za-z0-9-]{1,32}$/, {
    message: 'admissionNo must be 1-32 letters, digits or hyphens',
  })
  admissionNo: string;

  @IsString()
  @Length(NAME_MIN, NAME_MAX)
  nameBn: string;

  @IsString()
  @Length(NAME_MIN, NAME_MAX)
  nameEn: string;

  @IsOptional()
  @IsISO8601({ strict: true })
  dateOfBirth?: string;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsOptional()
  @IsEnum(BloodGroup)
  bloodGroup?: BloodGroup;

  @IsOptional()
  @IsEnum(Religion)
  religion?: Religion;

  @IsOptional()
  @IsString()
  @Length(1, 32)
  birthCertificateNo?: string;

  @IsOptional()
  @IsString()
  @Length(1, ADDRESS_MAX)
  addressBn?: string;

  @IsOptional()
  @IsString()
  @Length(1, ADDRESS_MAX)
  addressEn?: string;
}
