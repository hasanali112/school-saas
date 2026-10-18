import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  isForeignKeyViolation,
  isUniqueViolation,
} from '@common/services/database/database-errors';
import type { AuthUser } from '@module/auth/domain/auth-user';
import { ClassSubjectRole, SubjectKind } from '../domain/subject';
import type { ClassSubject, OfferedSubject, Subject } from '../domain/subject';
import { AttachClassSubjectDto } from '../dto/attach-class-subject.dto';
import { CreateSubjectDto } from '../dto/create-subject.dto';
import {
  ClassSubjectResponseDto,
  SubjectResponseDto,
} from '../dto/setup.response.dto';
import { SubjectsRepository } from '../application/ports/subjects.repository.port';

@Injectable()
export class SubjectsService {
  constructor(private readonly repo: SubjectsRepository) {}

  async create(
    dto: CreateSubjectDto,
    actor: AuthUser,
  ): Promise<SubjectResponseDto> {
    const isReligion = dto.kind === SubjectKind.Religion;
    if (isReligion && !dto.religion)
      throw new BadRequestException(
        'religion is required for a religion subject',
      );
    if (!isReligion && dto.religion)
      throw new BadRequestException(
        'religion applies only to religion subjects',
      );

    let row: Subject;
    try {
      row = await this.repo.insert({
        code: dto.code,
        nameBn: dto.nameBn,
        nameEn: dto.nameEn,
        kind: dto.kind,
        religion: dto.religion ?? null,
        institutionId: actor.institutionId,
      });
    } catch (error) {
      if (isUniqueViolation(error))
        throw new ConflictException(`Subject code ${dto.code} already exists`);
      throw error;
    }
    return SubjectResponseDto.from(row);
  }

  async list(): Promise<SubjectResponseDto[]> {
    return SubjectResponseDto.fromMany(await this.repo.findAll());
  }

  async attachToClass(
    classId: string,
    dto: AttachClassSubjectDto,
    actor: AuthUser,
  ): Promise<ClassSubjectResponseDto> {
    const subject = await this.repo.findById(dto.subjectId);
    if (!subject)
      throw new NotFoundException(`Subject ${dto.subjectId} not found`);

    const isReligionRole = dto.role === ClassSubjectRole.Religion;
    if (isReligionRole !== (subject.kind === SubjectKind.Religion)) {
      throw new BadRequestException(
        'Religion subjects must be attached with the religion role, and only those',
      );
    }

    let link: ClassSubject;
    try {
      link = await this.repo.attachToClass({
        classId,
        subjectId: subject.id,
        role: dto.role,
        institutionId: actor.institutionId,
      });
    } catch (error) {
      if (isUniqueViolation(error))
        throw new ConflictException(
          'Subject is already attached to this class',
        );
      if (isForeignKeyViolation(error))
        throw new BadRequestException('Unknown class');
      throw error;
    }
    return ClassSubjectResponseDto.from(link, subject);
  }

  async detachFromClass(classId: string, subjectId: string): Promise<void> {
    const removed = await this.repo.detachFromClass(classId, subjectId);
    if (!removed)
      throw new NotFoundException('Subject is not attached to this class');
  }

  async listForClass(classId: string): Promise<ClassSubjectResponseDto[]> {
    const rows = await this.repo.findByClass(classId);
    return rows.map(({ link, subject }) =>
      ClassSubjectResponseDto.from(link, subject),
    );
  }

  offeredInSection(sectionId: string): Promise<OfferedSubject[]> {
    return this.repo.findOfferedInSection(sectionId);
  }
}
