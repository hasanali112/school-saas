import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { PaginationQueryDto } from '@common/dto/pagination-query.dto';

export enum StudentStatus {
  Active = 'active',
  Promoted = 'promoted',
  Transferred = 'transferred',
  Exited = 'exited',
}

export class ListStudentsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  search?: string;

  @IsOptional()
  @IsEnum(StudentStatus)
  status?: StudentStatus;
}
