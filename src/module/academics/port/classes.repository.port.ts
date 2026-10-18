import type {
  ClassesWithSections,
  NewSchoolClass,
  NewSection,
  SchoolClass,
  Section,
  SectionRef,
} from '../domain/school-class';

export abstract class ClassesRepositoryPort {
  abstract insertClass(data: NewSchoolClass): Promise<SchoolClass>;
  abstract insertSection(data: NewSection): Promise<Section>;
  /** Two bounded queries (classes, all sections) instead of one per class. */
  abstract findAllWithSections(): Promise<ClassesWithSections>;
  abstract findSectionRefs(): Promise<SectionRef[]>;
}
