import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import {
  isForeignKeyViolation,
  isUniqueViolation,
} from '@common/services/database/database-errors';
import type { AuthUser } from '@common/types/auth-user';
import type { SchoolClass, Section, SectionRef } from '../domain/school-class';
import {
  ClassResponseDto,
  SectionResponseDto,
} from '../dto/academics.response.dto';
import { CreateClassDto } from '../dto/create-class.dto';
import { CreateSectionDto } from '../dto/create-section.dto';
import { ClassesRepository } from '../application/ports/classes.repository.port';

@Injectable()
export class ClassesService {
  constructor(private readonly repo: ClassesRepository) {}

  async createClass(
    dto: CreateClassDto,
    actor: AuthUser,
  ): Promise<ClassResponseDto> {
    let row: SchoolClass;
    try {
      row = await this.repo.insertClass({
        name: dto.name,
        ordinal: dto.ordinal,
        institutionId: actor.institutionId,
      });
    } catch (error) {
      if (isUniqueViolation(error))
        throw new ConflictException(`Class ${dto.name} already exists`);
      throw error;
    }
    return ClassResponseDto.from(row);
  }

  async createSection(
    classId: string,
    dto: CreateSectionDto,
    actor: AuthUser,
  ): Promise<SectionResponseDto> {
    let row: Section;
    try {
      row = await this.repo.insertSection({
        name: dto.name,
        shiftId: dto.shiftId ?? null,
        classId,
        institutionId: actor.institutionId,
      });
    } catch (error) {
      if (isUniqueViolation(error))
        throw new ConflictException(
          `Section ${dto.name} already exists in this class`,
        );
      // RLS hides other tenants' classes, so a foreign-key miss is indistinguishable from "not yours".
      if (isForeignKeyViolation(error))
        throw new BadRequestException('Unknown class or shift');
      throw error;
    }
    return SectionResponseDto.from(row);
  }

  async list(): Promise<ClassResponseDto[]> {
    const { classes, sections } = await this.repo.findAllWithSections();
    return ClassResponseDto.fromMany(classes, sections);
  }

  sectionRefs(): Promise<SectionRef[]> {
    return this.repo.findSectionRefs();
  }
}
