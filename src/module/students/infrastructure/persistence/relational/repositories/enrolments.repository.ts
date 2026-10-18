import { Injectable } from '@nestjs/common';
import { In } from 'typeorm';
import { DatabaseService } from '@common/services/database/database.service';
import type {
  Enrolment,
  NewEnrolment,
  RosterRow,
} from '../../../../domain/enrolment';
import { EnrolmentsRepository } from '../../../../application/ports/enrolments.repository.port';
import { EnrolmentEntity } from '../entities/enrolment.entity';
import { StudentEntity } from '../entities/student.entity';
import { EnrolmentMapper } from '../mappers/enrolment.mapper';
import { StudentMapper } from '../mappers/student.mapper';

@Injectable()
export class EnrolmentsRelationalRepository implements EnrolmentsRepository {
  constructor(private readonly db: DatabaseService) {}

  async insert(data: NewEnrolment): Promise<Enrolment> {
    const row = await this.db.tenant((m) =>
      m.save(EnrolmentMapper.toPersistence(data)),
    );
    return EnrolmentMapper.toDomain(row);
  }

  async findByStudent(studentId: string): Promise<Enrolment[]> {
    const rows = await this.db.tenant((m) =>
      m.find(EnrolmentEntity, {
        where: { studentId },
        order: { createdAt: 'ASC' },
      }),
    );
    return rows.map((row) => EnrolmentMapper.toDomain(row));
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
        return student
          ? [
              {
                enrolment: EnrolmentMapper.toDomain(enrolment),
                student: StudentMapper.toDomain(student),
              },
            ]
          : [];
      });
    });
  }
}
