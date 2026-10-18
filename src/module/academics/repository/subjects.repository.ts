import { Injectable } from '@nestjs/common';
import { In } from 'typeorm';
import { DatabaseService } from '@common/services/database/database.service';
import type {
  ClassSubject,
  ClassSubjectWithSubject,
  NewClassSubject,
  NewSubject,
  OfferedSubject,
  Subject,
} from '../domain/subject';
import { SubjectsRepositoryPort } from '../port/subjects.repository.port';
import { ClassSubjectEntity } from './entities/class-subject.entity';
import { SectionEntity } from './entities/section.entity';
import { SubjectEntity } from './entities/subject.entity';

@Injectable()
export class SubjectsRepository implements SubjectsRepositoryPort {
  constructor(private readonly db: DatabaseService) {}

  insert(data: NewSubject): Promise<Subject> {
    return this.db.tenant((m) => m.save(m.create(SubjectEntity, data)));
  }

  findAll(): Promise<Subject[]> {
    return this.db.tenant((m) =>
      m.find(SubjectEntity, { order: { code: 'ASC' } }),
    );
  }

  async findById(id: string): Promise<Subject | undefined> {
    return (
      (await this.db.tenant((m) => m.findOneBy(SubjectEntity, { id }))) ??
      undefined
    );
  }

  attachToClass(data: NewClassSubject): Promise<ClassSubject> {
    return this.db.tenant((m) => m.save(m.create(ClassSubjectEntity, data)));
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
          return subject ? [{ link, subject }] : [];
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
