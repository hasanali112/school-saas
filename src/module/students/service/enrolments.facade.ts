import { Injectable } from '@nestjs/common';
import type { AuthUser } from '@module/auth/domain/auth-user';
import type { RosterEntry } from '../domain/enrolment';
import { EnrolStudentDto } from '../dto/enrol-student.dto';
import {
  EnrolmentResponseDto,
  RosterResponseDto,
} from '../dto/enrolment.response.dto';
import { EnrolmentsService } from './enrolments.service';

/** Exported: attendance takes its sheet from the section roster. */
@Injectable()
export class EnrolmentsFacade {
  constructor(private readonly enrolments: EnrolmentsService) {}

  enrol(
    studentId: string,
    dto: EnrolStudentDto,
    actor: AuthUser,
  ): Promise<EnrolmentResponseDto> {
    return this.enrolments.enrol(studentId, dto, actor);
  }

  listForStudent(studentId: string): Promise<EnrolmentResponseDto[]> {
    return this.enrolments.listForStudent(studentId);
  }

  roster(sectionId: string, sessionId?: string): Promise<RosterResponseDto> {
    return this.enrolments.roster(sectionId, sessionId);
  }

  rosterEntries(sectionId: string, sessionId: string): Promise<RosterEntry[]> {
    return this.enrolments.rosterEntries(sectionId, sessionId);
  }
}
