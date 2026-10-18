import type {
  GuardianChild,
  LinkedGuardian,
  LinkInput,
} from '../domain/guardian';

export abstract class GuardiansRepositoryPort {
  /**
   * Upserts the guardian by phone, links, and keeps at most one primary per student,
   * in one transaction so a failed link never leaves a dangling guardian.
   */
  abstract link(input: LinkInput): Promise<LinkedGuardian>;
  abstract unlink(studentId: string, guardianId: string): Promise<boolean>;
  abstract findForStudent(studentId: string): Promise<LinkedGuardian[]>;
  abstract findChildren(guardianId: string): Promise<GuardianChild[]>;
}
