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
} from '../../../../domain/student';
import { StudentsRepository } from '../../../../application/ports/students.repository.port';
import { StudentEntity } from '../entities/student.entity';
import { StudentMapper } from '../mappers/student.mapper';

/** RLS scopes every query to the tenant. */
@Injectable()
export class StudentsRelationalRepository implements StudentsRepository {
  constructor(private readonly db: DatabaseService) {}

  async insert(data: NewStudent): Promise<Student> {
    const row = await this.db.tenant((m) =>
      m.save(StudentMapper.toPersistence(data)),
    );
    return StudentMapper.toDomain(row);
  }

  async findById(id: string): Promise<Student | undefined> {
    const row = await this.db.tenant((m) => m.findOneBy(StudentEntity, { id }));
    return row ? StudentMapper.toDomain(row) : undefined;
  }

  update(id: string, patch: StudentPatch): Promise<Student | undefined> {
    const values = withoutUndefined(patch);
    return this.db.tenant(async (m) => {
      if (Object.keys(values).length)
        await m.update(StudentEntity, { id }, values);
      const row = await m.findOneBy(StudentEntity, { id });
      return row ? StudentMapper.toDomain(row) : undefined;
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
      return { rows: rows.map((row) => StudentMapper.toDomain(row)), total };
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
