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
import { ClassSubjectRole } from '@module/academics/domain/subject';
import type { OfferedSubject } from '@module/academics/domain/subject';
import { SessionsFacade } from '@module/academics/services/sessions.facade';
import { SubjectsFacade } from '@module/academics/services/subjects.facade';
import type { AuthUser } from '@module/auth/domain/auth-user';
import type { Enrolment, RosterEntry } from '../domain/enrolment';
import { StudentStatus } from '../domain/student';
import type { Student } from '../domain/student';
import { EnrolStudentDto } from '../dto/enrol-student.dto';
import {
  EnrolmentResponseDto,
  RosterEntryDto,
  RosterResponseDto,
} from '../dto/enrolment.response.dto';
import { EnrolmentsRepository } from '../application/ports/enrolments.repository.port';
import { StudentsRepository } from '../application/ports/students.repository.port';

@Injectable()
export class EnrolmentsService {
  constructor(
    private readonly repo: EnrolmentsRepository,
    private readonly students: StudentsRepository,
    private readonly sessions: SessionsFacade,
    private readonly subjects: SubjectsFacade,
  ) {}

  async enrol(
    studentId: string,
    dto: EnrolStudentDto,
    actor: AuthUser,
  ): Promise<EnrolmentResponseDto> {
    const [student, sessionId, offered] = await Promise.all([
      this.students.findById(studentId),
      this.sessions.resolveId(dto.sessionId),
      this.subjects.offeredInSection(dto.sectionId),
    ]);
    if (!student) throw new NotFoundException(`Student ${studentId} not found`);
    if (student.status === StudentStatus.Exited)
      throw new ConflictException('An exited student cannot be enrolled');
    this.validateSubjectChoices(dto, student, offered);

    let row: Enrolment;
    try {
      row = await this.repo.insert({
        sectionId: dto.sectionId,
        rollNo: dto.rollNo,
        fourthSubjectId: dto.fourthSubjectId ?? null,
        religionSubjectId: dto.religionSubjectId ?? null,
        sessionId,
        studentId,
        institutionId: actor.institutionId,
      });
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new ConflictException(
          'Student is already enrolled in this session, or the roll number is taken',
        );
      }
      if (isForeignKeyViolation(error))
        throw new BadRequestException('Unknown session or section');
      throw error;
    }
    return EnrolmentResponseDto.from(row);
  }

  async listForStudent(studentId: string): Promise<EnrolmentResponseDto[]> {
    return EnrolmentResponseDto.fromMany(
      await this.repo.findByStudent(studentId),
    );
  }

  async roster(
    sectionId: string,
    sessionId?: string,
  ): Promise<RosterResponseDto> {
    const resolvedSessionId = await this.sessions.resolveId(sessionId);
    const entries = await this.rosterEntries(sectionId, resolvedSessionId);
    return new RosterResponseDto(
      sectionId,
      resolvedSessionId,
      entries.map((entry) => RosterEntryDto.from(entry)),
    );
  }

  /** The section's students for a session, ordered by roll. */
  async rosterEntries(
    sectionId: string,
    sessionId: string,
  ): Promise<RosterEntry[]> {
    const rows = await this.repo.findRoster(sectionId, sessionId);
    return rows.map(({ enrolment, student }) => ({
      enrolmentId: enrolment.id,
      studentId: student.id,
      rollNo: enrolment.rollNo,
      admissionNo: student.admissionNo,
      nameBn: student.nameBn,
      nameEn: student.nameEn,
      status: student.status,
    }));
  }

  /** Subject choices must be offered in the class with the matching role; religion must match the student. */
  private validateSubjectChoices(
    dto: EnrolStudentDto,
    student: Student,
    offered: OfferedSubject[],
  ): void {
    const bySubject = new Map(offered.map((o) => [o.subjectId, o]));

    if (dto.fourthSubjectId) {
      const choice = bySubject.get(dto.fourthSubjectId);
      if (!choice || choice.role !== ClassSubjectRole.FourthOptional) {
        throw new BadRequestException(
          'fourthSubjectId is not offered as a 4th subject in this class',
        );
      }
    }

    if (dto.religionSubjectId) {
      const choice = bySubject.get(dto.religionSubjectId);
      if (!choice || choice.role !== ClassSubjectRole.Religion) {
        throw new BadRequestException(
          'religionSubjectId is not offered as a religion subject in this class',
        );
      }
      if (student.religion && choice.religion !== student.religion) {
        throw new BadRequestException(
          "religionSubjectId does not match the student's religion",
        );
      }
    }
  }
}
