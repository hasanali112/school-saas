import { IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';

const MAX_ROLL = 9999;

export class EnrolStudentDto {
  /** Defaults to the current session. */
  @IsOptional()
  @IsUUID()
  sessionId?: string;

  @IsUUID()
  sectionId: string;

  @IsInt()
  @Min(1)
  @Max(MAX_ROLL)
  rollNo: number;

  /** Must be offered in the section's class with the fourth_optional role. */
  @IsOptional()
  @IsUUID()
  fourthSubjectId?: string;

  /** Must be offered with the religion role and match the student's religion. */
  @IsOptional()
  @IsUUID()
  religionSubjectId?: string;
}
