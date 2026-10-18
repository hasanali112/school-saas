import { IsInt, IsString, Length, Max, Min } from 'class-validator';

export class CreateClassDto {
  @IsString()
  @Length(1, 60)
  name: string;

  @IsInt()
  @Min(0)
  @Max(20)
  ordinal: number;
}
