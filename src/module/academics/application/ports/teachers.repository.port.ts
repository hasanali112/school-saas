import type { Role } from '@common/types/role';
import type {
  NewSectionClassTeacher,
  NewTeacherAssignment,
  SectionClassTeacher,
  SectionTeachers,
  TeacherAssignment,
  TeacherWorkload,
} from '../../domain/teacher-assignment';

export abstract class TeachersRepository {
  /** Roles of a user in this tenant, or undefined if the id is not one of ours (RLS). */
  abstract findUserRoles(userId: string): Promise<Role[] | undefined>;
  /** Reassigning a subject in a section replaces the previous teacher. */
  abstract upsertAssignment(
    data: NewTeacherAssignment,
  ): Promise<TeacherAssignment>;
  abstract removeAssignment(
    sectionId: string,
    assignmentId: string,
  ): Promise<boolean>;
  abstract upsertClassTeacher(
    data: NewSectionClassTeacher,
  ): Promise<SectionClassTeacher>;
  abstract findForSection(
    sectionId: string,
    sessionId: string,
  ): Promise<SectionTeachers>;
  abstract findForTeacher(
    teacherUserId: string,
    sessionId: string,
  ): Promise<TeacherWorkload>;
}
