import { Injectable } from '@nestjs/common';
import { DatabaseService } from '@common/services/database/database.service';
import type { Role } from '@module/auth/domain/role';
import { UserEntity } from '@module/users/infrastructure/persistence/relational/entities/user.entity';
import type {
  NewSectionClassTeacher,
  NewTeacherAssignment,
  SectionClassTeacher,
  SectionTeachers,
  TeacherAssignment,
  TeacherWorkload,
} from '../../../../domain/teacher-assignment';
import { TeachersRepository } from '../../../../application/ports/teachers.repository.port';
import {
  CLASS_TEACHER_CONFLICT,
  SectionClassTeacherEntity,
} from '../entities/section-class-teacher.entity';
import {
  TEACHER_ASSIGNMENT_CONFLICT,
  TeacherAssignmentEntity,
} from '../entities/teacher-assignment.entity';
import { SectionClassTeacherMapper } from '../mappers/section-class-teacher.mapper';
import { TeacherAssignmentMapper } from '../mappers/teacher-assignment.mapper';

@Injectable()
export class TeachersRelationalRepository implements TeachersRepository {
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
      const row = await m.findOneByOrFail(TeacherAssignmentEntity, {
        institutionId: data.institutionId,
        sessionId: data.sessionId,
        sectionId: data.sectionId,
        subjectId: data.subjectId,
      });
      return TeacherAssignmentMapper.toDomain(row);
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
      const row = await m.findOneByOrFail(SectionClassTeacherEntity, {
        institutionId: data.institutionId,
        sessionId: data.sessionId,
        sectionId: data.sectionId,
      });
      return SectionClassTeacherMapper.toDomain(row);
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
      return {
        classTeacher: classTeacher
          ? SectionClassTeacherMapper.toDomain(classTeacher)
          : undefined,
        subjectTeachers: subjectTeachers.map((row) =>
          TeacherAssignmentMapper.toDomain(row),
        ),
      };
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
      return {
        classTeacherOf: classTeacherOf.map((row) =>
          SectionClassTeacherMapper.toDomain(row),
        ),
        subjectAssignments: subjectAssignments.map((row) =>
          TeacherAssignmentMapper.toDomain(row),
        ),
      };
    });
  }
}
