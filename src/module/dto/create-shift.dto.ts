import { IsString, Length } from 'class-validator';

export class CreateShiftDto {
  @IsString()
  @Length(1, 60)
  name: string;
}
