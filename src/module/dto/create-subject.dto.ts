import { IsEnum, IsOptional, IsString, Length, Matches } from 'class-validator';

export enum SubjectKind {
  General = 'general',
  Religion = 'religion',
}

export enum Religion {
  Islam = 'islam',
  Hindu = 'hindu',
  Buddhist = 'buddhist',
  Christian = 'christian',
}

export class CreateSubjectDto {
  @Matches(/^[A-Za-z0-9-]{1,20}$/, {
    message: 'code must be 1-20 letters, digits or hyphens',
  })
  code: string;

  @IsString()
  @Length(1, 120)
  nameBn: string;

  @IsString()
  @Length(1, 120)
  nameEn: string;

  @IsOptional()
  @IsEnum(SubjectKind)
  kind: SubjectKind = SubjectKind.General;

  /** Required when kind is religion, forbidden otherwise (checked in the service). */
  @IsOptional()
  @IsEnum(Religion)
  religion?: Religion;
}
