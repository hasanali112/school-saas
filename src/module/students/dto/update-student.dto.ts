import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateStudentDto } from './create-student.dto';

/** Admission number is identity; it does not change after admission. */
export class UpdateStudentDto extends PartialType(
  OmitType(CreateStudentDto, ['admissionNo'] as const),
) {}
