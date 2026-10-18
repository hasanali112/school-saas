import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AuthUser } from '@modules/auth/auth-user';
import { Role } from '@modules/auth/roles';
import { isForeignKeyViolation } from '@database/database.errors';
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
import { SessionsService } from '../sessions/sessions.service';
import { TeachersRepository } from './teachers.repository';

const TEACHING_ROLES = new Set<string>([
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
        ...dto,
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
        ...dto,
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

  private async assertTeacher(userId: string): Promise<void> {
    const roles = await this.repo.findUserRoles(userId);
    if (!roles) throw new BadRequestException('Unknown teacher');
    if (!roles.some((role) => TEACHING_ROLES.has(role))) {
      throw new BadRequestException('User does not hold a teaching role');
    }
  }
}
