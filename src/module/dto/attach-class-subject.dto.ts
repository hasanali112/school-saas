import { IsEnum, IsOptional, IsUUID } from 'class-validator';

export const ClassSubjectRole = {
  Compulsory: 'compulsory',
  FourthOptional: 'fourth_optional',
  Religion: 'religion',
} as const;
export type ClassSubjectRole =
  (typeof ClassSubjectRole)[keyof typeof ClassSubjectRole];

export class AttachClassSubjectDto {
  @IsUUID()
  subjectId: string;

  @IsOptional()
  @IsEnum(ClassSubjectRole)
  role: ClassSubjectRole = ClassSubjectRole.Compulsory;
}
