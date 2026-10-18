import type {
  Enrolment,
  NewEnrolment,
  RosterRow,
} from '../../domain/enrolment';

export abstract class EnrolmentsRepository {
  abstract insert(data: NewEnrolment): Promise<Enrolment>;
  abstract findByStudent(studentId: string): Promise<Enrolment[]>;
  /** One join ordered by roll. */
  abstract findRoster(
    sectionId: string,
    sessionId: string,
  ): Promise<RosterRow[]>;
}
