import { Injectable } from '@nestjs/common';
import { In } from 'typeorm';
import { DatabaseService } from '@common/services/database/database.service';
import type { Enrolment, NewEnrolment, RosterRow } from '../domain/enrolment';
import { EnrolmentsRepositoryPort } from '../port/enrolments.repository.port';
import { EnrolmentEntity } from './entities/enrolment.entity';
import { StudentEntity } from './entities/student.entity';

@Injectable()
export class EnrolmentsRepository implements EnrolmentsRepositoryPort {
  constructor(private readonly db: DatabaseService) {}

  insert(data: NewEnrolment): Promise<Enrolment> {
    return this.db.tenant((m) => m.save(m.create(EnrolmentEntity, data)));
  }

  findByStudent(studentId: string): Promise<Enrolment[]> {
    return this.db.tenant((m) =>
      m.find(EnrolmentEntity, {
        where: { studentId },
        order: { createdAt: 'ASC' },
      }),
    );
  }

  /** Two bounded queries: the section's enrolments by roll, then their students. */
  findRoster(sectionId: string, sessionId: string): Promise<RosterRow[]> {
    return this.db.tenant(async (m) => {
      const enrolments = await m.find(EnrolmentEntity, {
        where: { sectionId, sessionId },
        order: { rollNo: 'ASC' },
      });
      if (enrolments.length === 0) return [];
      const students = await m.findBy(StudentEntity, {
        id: In(enrolments.map((e) => e.studentId)),
      });
      const byId = new Map(students.map((s) => [s.id, s]));
      return enrolments.flatMap((enrolment) => {
        const student = byId.get(enrolment.studentId);
        return student ? [{ enrolment, student }] : [];
      });
    });
  }
}
