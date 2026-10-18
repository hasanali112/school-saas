import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { AuthUser } from '@modules/auth/auth-user';
import {
  isForeignKeyViolation,
  isUniqueViolation,
} from '@database/database.errors';
import { ClassRow, SectionRow } from '@database/schema';
import {
  ClassResponseDto,
  SectionResponseDto,
} from '../dto/academics.response.dto';
import { CreateClassDto } from '../dto/create-class.dto';
import { CreateSectionDto } from '../dto/create-section.dto';
import { ClassesRepository } from './classes.repository';

@Injectable()
export class ClassesService {
  constructor(private readonly repo: ClassesRepository) {}

  async createClass(
    dto: CreateClassDto,
    actor: AuthUser,
  ): Promise<ClassResponseDto> {
    let row: ClassRow;
    try {
      row = await this.repo.insertClass({
        ...dto,
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
    let row: SectionRow;
    try {
      row = await this.repo.insertSection({
        ...dto,
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
    const { classRows, sectionRows } = await this.repo.findAllWithSections();
    return ClassResponseDto.fromMany(classRows, sectionRows);
  }
}
