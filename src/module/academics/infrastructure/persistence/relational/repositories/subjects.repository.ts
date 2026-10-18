import { Injectable } from '@nestjs/common';
import { In } from 'typeorm';
import { DatabaseService } from '@common/services/database/database.service';
import { SubjectsRepository } from '../../../../application/ports/subjects.repository.port';
import type {
  ClassSubject,
  ClassSubjectWithSubject,
  NewClassSubject,
  NewSubject,
  OfferedSubject,
  Subject,
} from '../../../../domain/subject';
import { ClassSubjectEntity } from '../entities/class-subject.entity';
import { SectionEntity } from '../entities/section.entity';
import { SubjectEntity } from '../entities/subject.entity';
import { ClassSubjectMapper } from '../mappers/class-subject.mapper';
import { SubjectMapper } from '../mappers/subject.mapper';

@Injectable()
export class SubjectsRelationalRepository implements SubjectsRepository {
  constructor(private readonly db: DatabaseService) {}

  async insert(data: NewSubject): Promise<Subject> {
    const row = await this.db.tenant((m) =>
      m.save(SubjectMapper.toPersistence(data)),
    );
    return SubjectMapper.toDomain(row);
  }

  async findAll(): Promise<Subject[]> {
    const rows = await this.db.tenant((m) =>
      m.find(SubjectEntity, { order: { code: 'ASC' } }),
    );
    return rows.map((row) => SubjectMapper.toDomain(row));
  }

  async findById(id: string): Promise<Subject | undefined> {
    const row = await this.db.tenant((m) => m.findOneBy(SubjectEntity, { id }));
    return row ? SubjectMapper.toDomain(row) : undefined;
  }

  async attachToClass(data: NewClassSubject): Promise<ClassSubject> {
    const row = await this.db.tenant((m) =>
      m.save(ClassSubjectMapper.toPersistence(data)),
    );
    return ClassSubjectMapper.toDomain(row);
  }

  async detachFromClass(classId: string, subjectId: string): Promise<boolean> {
    const { affected } = await this.db.tenant((m) =>
      m.delete(ClassSubjectEntity, { classId, subjectId }),
    );
    return !!affected;
  }

  /** Two bounded queries: the links, then their subjects; ordered by subject code. */
  findByClass(classId: string): Promise<ClassSubjectWithSubject[]> {
    return this.db.tenant(async (m) => {
      const links = await m.findBy(ClassSubjectEntity, { classId });
      if (links.length === 0) return [];
      const subjects = await m.findBy(SubjectEntity, {
        id: In(links.map((link) => link.subjectId)),
      });
      const byId = new Map(subjects.map((s) => [s.id, s]));
      return links
        .flatMap((link) => {
          const subject = byId.get(link.subjectId);
          return subject
            ? [
                {
                  link: ClassSubjectMapper.toDomain(link),
                  subject: SubjectMapper.toDomain(subject),
                },
              ]
            : [];
        })
        .sort((a, b) => a.subject.code.localeCompare(b.subject.code));
    });
  }

  findOfferedInSection(sectionId: string): Promise<OfferedSubject[]> {
    return this.db.tenant((m) =>
      m
        .createQueryBuilder(SectionEntity, 'sec')
        .innerJoin(ClassSubjectEntity, 'cs', 'cs.classId = sec.classId')
        .innerJoin(SubjectEntity, 'sub', 'sub.id = cs.subjectId')
        .select('cs.subjectId', 'subjectId')
        .addSelect('cs.role', 'role')
        .addSelect('sub.religion', 'religion')
        .where('sec.id = :sectionId', { sectionId })
        .getRawMany<OfferedSubject>(),
    );
  }
}
