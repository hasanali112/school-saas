import type {
  AcademicSession,
  NewAcademicSession,
} from '../../domain/academic-session';

export abstract class SessionsRepository {
  /** If the new session is current, the previous current one is cleared in the same transaction. */
  abstract insert(data: NewAcademicSession): Promise<AcademicSession>;
  abstract findAll(): Promise<AcademicSession[]>;
  abstract findById(id: string): Promise<AcademicSession | undefined>;
  abstract findCurrentId(): Promise<string | undefined>;
  abstract setCurrent(id: string): Promise<AcademicSession | undefined>;
}
