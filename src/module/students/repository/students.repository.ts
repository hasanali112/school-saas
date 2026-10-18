import { Injectable } from '@nestjs/common';
import { FindOptionsWhere, ILike } from 'typeorm';
import { DatabaseService } from '@common/services/database/database.service';
import type { Page } from '@common/types/paginated';
import { withoutUndefined } from '@common/utils/object/without-undefined';
import type {
  NewStudent,
  Student,
  StudentFilter,
  StudentPatch,
} from '../domain/student';
import { StudentsRepositoryPort } from '../port/students.repository.port';
import { StudentEntity } from './entities/student.entity';

/** RLS scopes every query to the tenant. */
@Injectable()
export class StudentsRepository implements StudentsRepositoryPort {
  constructor(private readonly db: DatabaseService) {}

  insert(data: NewStudent): Promise<Student> {
    return this.db.tenant((m) => m.save(m.create(StudentEntity, data)));
  }

  async findById(id: string): Promise<Student | undefined> {
    return (
      (await this.db.tenant((m) => m.findOneBy(StudentEntity, { id }))) ??
      undefined
    );
  }

  update(id: string, patch: StudentPatch): Promise<Student | undefined> {
    const values = withoutUndefined(patch);
    return this.db.tenant(async (m) => {
      if (Object.keys(values).length)
        await m.update(StudentEntity, { id }, values);
      return (await m.findOneBy(StudentEntity, { id })) ?? undefined;
    });
  }

  findPage(
    offset: number,
    limit: number,
    filter: StudentFilter,
  ): Promise<Page<Student>> {
    return this.db.tenant(async (m) => {
      const [rows, total] = await m.findAndCount(StudentEntity, {
        where: this.buildWhere(filter),
        order: { nameEn: 'ASC' },
        skip: offset,
        take: limit,
      });
      return { rows, total };
    });
  }

  /** An array of conditions is OR-ed by TypeORM: search matches either name or the admission number. */
  private buildWhere({
    search,
    status,
  }: StudentFilter): FindOptionsWhere<StudentEntity>[] {
    const base: FindOptionsWhere<StudentEntity> = status ? { status } : {};
    if (!search) return [base];
    const pattern = ILike(`%${search}%`);
    return [
      { ...base, nameEn: pattern },
      { ...base, nameBn: pattern },
      { ...base, admissionNo: pattern },
    ];
  }
}
