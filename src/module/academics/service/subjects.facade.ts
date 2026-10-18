import { Injectable } from '@nestjs/common';
import type { AuthUser } from '@module/auth/domain/auth-user';
import type { OfferedSubject } from '../domain/subject';
import { AttachClassSubjectDto } from '../dto/attach-class-subject.dto';
import { CreateSubjectDto } from '../dto/create-subject.dto';
import {
  ClassSubjectResponseDto,
  SubjectResponseDto,
} from '../dto/setup.response.dto';
import { SubjectsService } from './subjects.service';

@Injectable()
export class SubjectsFacade {
  constructor(private readonly subjects: SubjectsService) {}

  create(dto: CreateSubjectDto, actor: AuthUser): Promise<SubjectResponseDto> {
    return this.subjects.create(dto, actor);
  }

  list(): Promise<SubjectResponseDto[]> {
    return this.subjects.list();
  }

  attachToClass(
    classId: string,
    dto: AttachClassSubjectDto,
    actor: AuthUser,
  ): Promise<ClassSubjectResponseDto> {
    return this.subjects.attachToClass(classId, dto, actor);
  }

  detachFromClass(classId: string, subjectId: string): Promise<void> {
    return this.subjects.detachFromClass(classId, subjectId);
  }

  listForClass(classId: string): Promise<ClassSubjectResponseDto[]> {
    return this.subjects.listForClass(classId);
  }

  /** Enrolment validates a student's 4th and religion subject against these. */
  offeredInSection(sectionId: string): Promise<OfferedSubject[]> {
    return this.subjects.offeredInSection(sectionId);
  }
}
