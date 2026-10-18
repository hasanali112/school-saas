import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CurrentUser } from '@module/auth/decorators/current-user.decorator';
import { Roles } from '@module/auth/decorators/roles.decorator';
import type { AuthUser } from '@module/auth/domain/auth-user';
import { Paginated } from '@common/types/paginated';
import { CreateStudentDto } from '../dto/create-student.dto';
import { ExitStudentDto } from '../dto/exit-student.dto';
import { ListStudentsQueryDto } from '../dto/list-students-query.dto';
import { StudentResponseDto } from '../dto/student.response.dto';
import { UpdateStudentDto } from '../dto/update-student.dto';
import { StudentsFacade } from '../service/students.facade';
import { STUDENT_READ_ROLES, STUDENT_WRITE_ROLES } from './student-roles';

/** HTTP only: parse, delegate, return. No business rules here. */
@Controller('students')
export class StudentsController {
  constructor(private readonly students: StudentsFacade) {}

  @Get()
  @Roles(STUDENT_READ_ROLES)
  list(
    @Query() query: ListStudentsQueryDto,
  ): Promise<Paginated<StudentResponseDto>> {
    return this.students.list(query);
  }

  @Get(':id')
  @Roles(STUDENT_READ_ROLES)
  getById(@Param('id', ParseUUIDPipe) id: string): Promise<StudentResponseDto> {
    return this.students.getById(id);
  }

  @Post()
  @Roles(STUDENT_WRITE_ROLES)
  create(
    @Body() dto: CreateStudentDto,
    @CurrentUser() user: AuthUser,
  ): Promise<StudentResponseDto> {
    return this.students.create(dto, user);
  }

  @Patch(':id')
  @Roles(STUDENT_WRITE_ROLES)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateStudentDto,
  ): Promise<StudentResponseDto> {
    return this.students.update(id, dto);
  }

  @Post(':id/exit')
  @Roles(STUDENT_WRITE_ROLES)
  @HttpCode(HttpStatus.OK)
  exit(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ExitStudentDto,
    @CurrentUser() user: AuthUser,
  ): Promise<StudentResponseDto> {
    return this.students.exit(id, dto, user);
  }
}
