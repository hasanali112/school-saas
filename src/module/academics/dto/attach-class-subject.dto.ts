import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { ClassSubjectRole } from '../domain/subject';

export class AttachClassSubjectDto {
  @IsUUID()
  subjectId: string;

  @IsOptional()
  @IsEnum(ClassSubjectRole)
  role: ClassSubjectRole = ClassSubjectRole.Compulsory;
}
