import { IsOptional, IsString, Length, Matches } from 'class-validator';

const NAME_MAX = 200;
const ADDRESS_MAX = 500;

export class UpdateInstitutionDto {
  @IsOptional()
  @IsString()
  @Length(1, NAME_MAX)
  nameBn?: string;

  @IsOptional()
  @IsString()
  @Length(1, NAME_MAX)
  nameEn?: string;

  /** Education Institution Identification Number: 6 digits. */
  @IsOptional()
  @Matches(/^\d{6}$/, { message: 'eiin must be 6 digits' })
  eiin?: string;

  @IsOptional()
  @IsString()
  @Length(1, ADDRESS_MAX)
  addressBn?: string;

  @IsOptional()
  @IsString()
  @Length(1, ADDRESS_MAX)
  addressEn?: string;

  @IsOptional()
  @IsString()
  @Length(6, 20)
  phone?: string;
}
