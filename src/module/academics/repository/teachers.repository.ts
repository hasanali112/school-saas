import { Injectable } from '@nestjs/common';
import { DatabaseService } from '@common/services/database/database.service';
import type { Role } from '@module/auth/domain/role';
import { UserEntity } from '@module/users/repository/entities/user.entity';
import type {
  NewSectionClassTeacher,
  NewTeacherAssignment,
  SectionClassTeacher,
  SectionTeachers,
  TeacherAssignment,
  TeacherWorkload,
} from '../domain/teacher-assignment';
import { TeachersRepositoryPort } from '../port/teachers.repository.port';
import {
  CLASS_TEACHER_CONFLICT,
  SectionClassTeacherEntity,
} from './entities/section-class-teacher.entity';
import {
  TEACHER_ASSIGNMENT_CONFLICT,
  TeacherAssignmentEntity,
} from './entities/teacher-assignment.entity';

@Injectable()
export class TeachersRepository implements TeachersRepositoryPort {
  constructor(private readonly db: DatabaseService) {}

  /**
   * Reads the users table (owned by the users module) because the users module
   * depends on academics through auth → sms, so a facade call would be a cycle.
   */
  async findUserRoles(userId: string): Promise<Role[] | undefined> {
    const row = await this.db.tenant((m) =>
      m.findOne(UserEntity, { select: { roles: true }, where: { id: userId } }),
    );
    return row?.roles;
  }

  upsertAssignment(data: NewTeacherAssignment): Promise<TeacherAssignment> {
    return this.db.tenant(async (m) => {
      await m.upsert(
        TeacherAssignmentEntity,
        data,
        TEACHER_ASSIGNMENT_CONFLICT,
      );
      return m.findOneByOrFail(TeacherAssignmentEntity, {
        institutionId: data.institutionId,
        sessionId: data.sessionId,
        sectionId: data.sectionId,
        subjectId: data.subjectId,
      });
    });
  }

  async removeAssignment(
    sectionId: string,
    assignmentId: string,
  ): Promise<boolean> {
    const { affected } = await this.db.tenant((m) =>
      m.delete(TeacherAssignmentEntity, { id: assignmentId, sectionId }),
    );
    return !!affected;
  }

  upsertClassTeacher(
    data: NewSectionClassTeacher,
  ): Promise<SectionClassTeacher> {
    return this.db.tenant(async (m) => {
      await m.upsert(SectionClassTeacherEntity, data, CLASS_TEACHER_CONFLICT);
      return m.findOneByOrFail(SectionClassTeacherEntity, {
        institutionId: data.institutionId,
        sessionId: data.sessionId,
        sectionId: data.sectionId,
      });
    });
  }

  findForSection(
    sectionId: string,
    sessionId: string,
  ): Promise<SectionTeachers> {
    return this.db.tenant(async (m) => {
      const [classTeacher, subjectTeachers] = await Promise.all([
        m.findOneBy(SectionClassTeacherEntity, { sectionId, sessionId }),
        m.findBy(TeacherAssignmentEntity, { sectionId, sessionId }),
      ]);
      return { classTeacher: classTeacher ?? undefined, subjectTeachers };
    });
  }

  findForTeacher(
    teacherUserId: string,
    sessionId: string,
  ): Promise<TeacherWorkload> {
    return this.db.tenant(async (m) => {
      const [classTeacherOf, subjectAssignments] = await Promise.all([
        m.findBy(SectionClassTeacherEntity, { teacherUserId, sessionId }),
        m.findBy(TeacherAssignmentEntity, { teacherUserId, sessionId }),
      ]);
      return { classTeacherOf, subjectAssignments };
    });
  }
}
