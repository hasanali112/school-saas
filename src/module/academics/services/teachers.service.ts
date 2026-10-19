import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { isForeignKeyViolation } from '@common/services/database/database-errors';
import type { AuthUser } from '@common/types/auth-user';
import { Role } from '@common/types/role';
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
import { TeachersRepository } from '../application/ports/teachers.repository.port';
import { SessionsService } from './sessions.service';

const TEACHING_ROLES: ReadonlySet<Role> = new Set([
  Role.ClassTeacher,
  Role.SubjectTeacher,
  Role.InstituteHead,
]);

@Injectable()
export class TeachersService {
  constructor(
    private readonly repo: TeachersRepository,
    private readonly sessions: SessionsService,
  ) {}

  async assignSubjectTeacher(
    sectionId: string,
    dto: AssignTeacherDto,
    actor: AuthUser,
  ): Promise<TeacherAssignmentResponseDto> {
    await this.assertTeacher(dto.teacherUserId);
    try {
      const row = await this.repo.upsertAssignment({
        sessionId: dto.sessionId,
        subjectId: dto.subjectId,
        teacherUserId: dto.teacherUserId,
        sectionId,
        institutionId: actor.institutionId,
      });
      return TeacherAssignmentResponseDto.from(row);
    } catch (error) {
      if (isForeignKeyViolation(error))
        throw new BadRequestException('Unknown session, section or subject');
      throw error;
    }
  }

  async removeSubjectTeacher(
    sectionId: string,
    assignmentId: string,
  ): Promise<void> {
    const removed = await this.repo.removeAssignment(sectionId, assignmentId);
    if (!removed) throw new NotFoundException('Assignment not found');
  }

  async assignClassTeacher(
    sectionId: string,
    dto: AssignClassTeacherDto,
    actor: AuthUser,
  ): Promise<ClassTeacherResponseDto> {
    await this.assertTeacher(dto.teacherUserId);
    try {
      const row = await this.repo.upsertClassTeacher({
        sessionId: dto.sessionId,
        teacherUserId: dto.teacherUserId,
        sectionId,
        institutionId: actor.institutionId,
      });
      return ClassTeacherResponseDto.from(row);
    } catch (error) {
      if (isForeignKeyViolation(error))
        throw new BadRequestException('Unknown session or section');
      throw error;
    }
  }

  async listForSection(
    sectionId: string,
    sessionId?: string,
  ): Promise<SectionTeachersResponseDto> {
    const resolvedSessionId = await this.sessions.resolveId(sessionId);
    const { classTeacher, subjectTeachers } = await this.repo.findForSection(
      sectionId,
      resolvedSessionId,
    );
    return new SectionTeachersResponseDto(
      sectionId,
      resolvedSessionId,
      classTeacher ? ClassTeacherResponseDto.from(classTeacher) : null,
      TeacherAssignmentResponseDto.fromMany(subjectTeachers),
    );
  }

  async myAssignments(
    actor: AuthUser,
    sessionId?: string,
  ): Promise<MyAssignmentsResponseDto> {
    const resolvedSessionId = await this.sessions.resolveId(sessionId);
    const { classTeacherOf, subjectAssignments } =
      await this.repo.findForTeacher(actor.id, resolvedSessionId);
    return new MyAssignmentsResponseDto(
      resolvedSessionId,
      classTeacherOf.map((row) => row.sectionId),
      TeacherAssignmentResponseDto.fromMany(subjectAssignments),
    );
  }

  /** Sections a user teaches in a session, as class teacher or subject teacher. */
  async assignedSectionIds(
    userId: string,
    sessionId: string,
  ): Promise<Set<string>> {
    const { classTeacherOf, subjectAssignments } =
      await this.repo.findForTeacher(userId, sessionId);
    return new Set(
      [...classTeacherOf, ...subjectAssignments].map((row) => row.sectionId),
    );
  }

  private async assertTeacher(userId: string): Promise<void> {
    const roles = await this.repo.findUserRoles(userId);
    if (!roles) throw new BadRequestException('Unknown teacher');
    if (!roles.some((role) => TEACHING_ROLES.has(role))) {
      throw new BadRequestException('User does not hold a teaching role');
    }
  }
}
