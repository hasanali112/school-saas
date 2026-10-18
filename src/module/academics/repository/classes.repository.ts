import { Injectable } from '@nestjs/common';
import { DatabaseService } from '@common/services/database/database.service';
import type {
  ClassesWithSections,
  NewSchoolClass,
  NewSection,
  SchoolClass,
  Section,
  SectionRef,
} from '../domain/school-class';
import { ClassesRepositoryPort } from '../port/classes.repository.port';
import { SchoolClassEntity } from './entities/school-class.entity';
import { SectionEntity } from './entities/section.entity';

@Injectable()
export class ClassesRepository implements ClassesRepositoryPort {
  constructor(private readonly db: DatabaseService) {}

  insertClass(data: NewSchoolClass): Promise<SchoolClass> {
    return this.db.tenant((m) => m.save(m.create(SchoolClassEntity, data)));
  }

  insertSection(data: NewSection): Promise<Section> {
    return this.db.tenant((m) => m.save(m.create(SectionEntity, data)));
  }

  findAllWithSections(): Promise<ClassesWithSections> {
    return this.db.tenant(async (m) => {
      const [classes, sections] = await Promise.all([
        m.find(SchoolClassEntity, { order: { ordinal: 'ASC' } }),
        m.find(SectionEntity, { order: { name: 'ASC' } }),
      ]);
      return { classes, sections };
    });
  }

  findSectionRefs(): Promise<SectionRef[]> {
    return this.db.tenant((m) =>
      m
        .createQueryBuilder(SectionEntity, 's')
        .innerJoin(SchoolClassEntity, 'c', 'c.id = s.classId')
        .select('s.id', 'sectionId')
        .addSelect('c.id', 'classId')
        .addSelect('c.name', 'className')
        .addSelect('s.name', 'sectionName')
        .getRawMany<SectionRef>(),
    );
  }
}
