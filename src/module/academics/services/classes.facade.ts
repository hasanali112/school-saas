import { Injectable } from '@nestjs/common';
import type { AuthUser } from '@common/types/auth-user';
import type { SectionRef } from '../domain/school-class';
import {
  ClassResponseDto,
  SectionResponseDto,
} from '../dto/academics.response.dto';
import { CreateClassDto } from '../dto/create-class.dto';
import { CreateSectionDto } from '../dto/create-section.dto';
import { ClassesService } from './classes.service';

@Injectable()
export class ClassesFacade {
  constructor(private readonly classes: ClassesService) {}

  createClass(dto: CreateClassDto, actor: AuthUser): Promise<ClassResponseDto> {
    return this.classes.createClass(dto, actor);
  }

  createSection(
    classId: string,
    dto: CreateSectionDto,
    actor: AuthUser,
  ): Promise<SectionResponseDto> {
    return this.classes.createSection(classId, dto, actor);
  }

  list(): Promise<ClassResponseDto[]> {
    return this.classes.list();
  }

  /** Every section with its class name; the student import matches rows against these. */
  sectionRefs(): Promise<SectionRef[]> {
    return this.classes.sectionRefs();
  }
}
