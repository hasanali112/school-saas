import { Injectable } from '@nestjs/common';
import type { AuthUser } from '@common/types/auth-user';
import {
  AssignClassTeacherDto,
  AssignTeacherDto,
} from '../dto/assign-teacher.dto';
import {
  ClassTeacherResponseDto,
  MyAssignmentsResponseDto,
  SectionTeachersResponseDto,
  TeacherAssignmentResponseDto,
} from '../dto/setup.response.dto';
import { TeachersService } from './teachers.service';

@Injectable()
export class TeachersFacade {
  constructor(private readonly teachers: TeachersService) {}

  assignSubjectTeacher(
    sectionId: string,
    dto: AssignTeacherDto,
    actor: AuthUser,
  ): Promise<TeacherAssignmentResponseDto> {
    return this.teachers.assignSubjectTeacher(sectionId, dto, actor);
  }

  removeSubjectTeacher(sectionId: string, assignmentId: string): Promise<void> {
    return this.teachers.removeSubjectTeacher(sectionId, assignmentId);
  }

  assignClassTeacher(
    sectionId: string,
    dto: AssignClassTeacherDto,
    actor: AuthUser,
  ): Promise<ClassTeacherResponseDto> {
    return this.teachers.assignClassTeacher(sectionId, dto, actor);
  }

  listForSection(
    sectionId: string,
    sessionId?: string,
  ): Promise<SectionTeachersResponseDto> {
    return this.teachers.listForSection(sectionId, sessionId);
  }

  myAssignments(
    actor: AuthUser,
    sessionId?: string,
  ): Promise<MyAssignmentsResponseDto> {
    return this.teachers.myAssignments(actor, sessionId);
  }

  /** Attendance limits teachers to these sections. */
  assignedSectionIds(userId: string, sessionId: string): Promise<Set<string>> {
    return this.teachers.assignedSectionIds(userId, sessionId);
  }
}
