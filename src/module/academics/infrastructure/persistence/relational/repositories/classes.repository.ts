import { Injectable } from '@nestjs/common';
import { DatabaseService } from '@common/services/database/database.service';
import { ClassesRepository } from '../../../../application/ports/classes.repository.port';
import type {
  ClassesWithSections,
  NewSchoolClass,
  NewSection,
  SchoolClass,
  Section,
  SectionRef,
} from '../../../../domain/school-class';
import { SchoolClassEntity } from '../entities/school-class.entity';
import { SectionEntity } from '../entities/section.entity';
import { SchoolClassMapper } from '../mappers/school-class.mapper';
import { SectionMapper } from '../mappers/section.mapper';

@Injectable()
export class ClassesRelationalRepository implements ClassesRepository {
  constructor(private readonly db: DatabaseService) {}

  async insertClass(data: NewSchoolClass): Promise<SchoolClass> {
    const row = await this.db.tenant((m) =>
      m.save(SchoolClassMapper.toPersistence(data)),
    );
    return SchoolClassMapper.toDomain(row);
  }

  async insertSection(data: NewSection): Promise<Section> {
    const row = await this.db.tenant((m) =>
      m.save(SectionMapper.toPersistence(data)),
    );
    return SectionMapper.toDomain(row);
  }

  findAllWithSections(): Promise<ClassesWithSections> {
    return this.db.tenant(async (m) => {
      const [classes, sections] = await Promise.all([
        m.find(SchoolClassEntity, { order: { ordinal: 'ASC' } }),
        m.find(SectionEntity, { order: { name: 'ASC' } }),
      ]);
      return {
        classes: classes.map((row) => SchoolClassMapper.toDomain(row)),
        sections: sections.map((row) => SectionMapper.toDomain(row)),
      };
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
