import { IsOptional, IsUUID } from 'class-validator';

export class AssignTeacherDto {
  @IsUUID()
  sessionId: string;

  @IsUUID()
  subjectId: string;

  @IsUUID()
  teacherUserId: string;
}

export class AssignClassTeacherDto {
  @IsUUID()
  sessionId: string;

  @IsUUID()
  teacherUserId: string;
}

export class SessionQueryDto {
  /** Defaults to the current session when omitted. */
  @IsOptional()
  @IsUUID()
  sessionId?: string;
}
