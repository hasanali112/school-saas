import { IsOptional, IsString, IsUUID, Length } from 'class-validator';

export class CreateSectionDto {
  @IsString()
  @Length(1, 60)
  name: string;

  @IsOptional()
  @IsUUID()
  shiftId?: string;
}
