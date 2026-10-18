import { Injectable } from '@nestjs/common';
import type { AuthUser } from '@module/auth/domain/auth-user';
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
}
