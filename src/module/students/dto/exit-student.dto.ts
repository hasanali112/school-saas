import { IsString, Length } from 'class-validator';

export class ExitStudentDto {
  @IsString()
  @Length(2, 500)
  reason: string;
}
