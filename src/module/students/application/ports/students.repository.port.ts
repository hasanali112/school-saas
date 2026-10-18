import type { Page } from '@common/types/paginated';
import type {
  NewStudent,
  Student,
  StudentFilter,
  StudentPatch,
} from '../../domain/student';

export abstract class StudentsRepository {
  abstract insert(data: NewStudent): Promise<Student>;
  abstract findById(id: string): Promise<Student | undefined>;
  abstract update(
    id: string,
    patch: StudentPatch,
  ): Promise<Student | undefined>;
  abstract findPage(
    offset: number,
    limit: number,
    filter: StudentFilter,
  ): Promise<Page<Student>>;
}
