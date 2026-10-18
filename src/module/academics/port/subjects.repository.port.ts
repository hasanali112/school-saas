import type {
  ClassSubject,
  ClassSubjectWithSubject,
  NewClassSubject,
  NewSubject,
  OfferedSubject,
  Subject,
} from '../domain/subject';

export abstract class SubjectsRepositoryPort {
  abstract insert(data: NewSubject): Promise<Subject>;
  abstract findAll(): Promise<Subject[]>;
  abstract findById(id: string): Promise<Subject | undefined>;
  abstract attachToClass(data: NewClassSubject): Promise<ClassSubject>;
  abstract detachFromClass(
    classId: string,
    subjectId: string,
  ): Promise<boolean>;
  /** One join, ordered by subject code. */
  abstract findByClass(classId: string): Promise<ClassSubjectWithSubject[]>;
  /** Subjects offered in the class of a section; empty when the section is unknown (or not ours). */
  abstract findOfferedInSection(sectionId: string): Promise<OfferedSubject[]>;
}
