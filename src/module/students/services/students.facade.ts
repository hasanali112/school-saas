import { Injectable } from '@nestjs/common';
import { Paginated } from '@common/types/paginated';
import type { AuthUser } from '@module/auth/domain/auth-user';
import { CreateStudentDto } from '../dto/create-student.dto';
import { ExitStudentDto } from '../dto/exit-student.dto';
import { ListStudentsQueryDto } from '../dto/list-students-query.dto';
import { StudentResponseDto } from '../dto/student.response.dto';
import { UpdateStudentDto } from '../dto/update-student.dto';
import { StudentsService } from './students.service';

@Injectable()
export class StudentsFacade {
  constructor(private readonly students: StudentsService) {}

  create(dto: CreateStudentDto, actor: AuthUser): Promise<StudentResponseDto> {
    return this.students.create(dto, actor);
  }

  getById(id: string): Promise<StudentResponseDto> {
    return this.students.getById(id);
  }

  update(id: string, dto: UpdateStudentDto): Promise<StudentResponseDto> {
    return this.students.update(id, dto);
  }

  exit(
    id: string,
    dto: ExitStudentDto,
    actor: AuthUser,
  ): Promise<StudentResponseDto> {
    return this.students.exit(id, dto, actor);
  }

  list(query: ListStudentsQueryDto): Promise<Paginated<StudentResponseDto>> {
    return this.students.list(query);
  }
}
