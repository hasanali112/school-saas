import { Injectable } from '@nestjs/common';
import { EntityManager, In } from 'typeorm';
import type { ObjectLiteral, QueryDeepPartialEntity } from 'typeorm';
import { DatabaseService } from '@common/services/database/database.service';
import { rollKey } from '../domain/import';
import type { ExistingRefs, ImportRecord } from '../domain/import';
import { ImportRepositoryPort } from '../port/import.repository.port';
import { EnrolmentEntity } from './entities/enrolment.entity';
import { GuardianEntity } from './entities/guardian.entity';
import { StudentGuardianEntity } from './entities/student-guardian.entity';
import { StudentEntity } from './entities/student.entity';

/** Rows per INSERT: keeps every statement well under Postgres' 65,535 bind parameters. */
const CHUNK_SIZE = 500;

@Injectable()
export class ImportRepository implements ImportRepositoryPort {
  constructor(private readonly db: DatabaseService) {}

  findExisting(
    admissionNos: readonly string[],
    sessionId: string,
  ): Promise<ExistingRefs> {
    return this.db.tenant(async (m) => {
      const [students, enrolments] = await Promise.all([
        admissionNos.length
          ? m.find(StudentEntity, {
              select: { admissionNo: true },
              where: { admissionNo: In([...admissionNos]) },
            })
          : Promise.resolve([]),
        m.find(EnrolmentEntity, {
          select: { sectionId: true, rollNo: true },
          where: { sessionId },
        }),
      ]);
      return {
        admissionNos: new Set(students.map((s) => s.admissionNo)),
        takenRolls: new Set(
          enrolments.map((e) => rollKey(e.sectionId, e.rollNo)),
        ),
      };
    });
  }

  importAll(
    institutionId: string,
    sessionId: string,
    records: readonly ImportRecord[],
  ): Promise<number> {
    if (records.length === 0) return Promise.resolve(0);
    return this.db.tenant(async (m) => {
      const inserted = await m.save(
        StudentEntity,
        records.map((r) =>
          m.create(StudentEntity, { ...r.student, institutionId }),
        ),
        { chunk: CHUNK_SIZE },
      );
      const idByAdmission = new Map(inserted.map((s) => [s.admissionNo, s.id]));
      const studentId = (r: ImportRecord): string =>
        idByAdmission.get(r.student.admissionNo)!;

      await this.insertChunked(
        m,
        EnrolmentEntity,
        records.map((r) => ({
          institutionId,
          sessionId,
          sectionId: r.sectionId,
          rollNo: r.rollNo,
          studentId: studentId(r),
        })),
      );
      await this.linkGuardians(m, institutionId, records, studentId);
      return inserted.length;
    });
  }

  /** New phones become guardians; known phones keep their row and name. Each becomes the primary guardian. */
  private async linkGuardians(
    m: EntityManager,
    institutionId: string,
    records: readonly ImportRecord[],
    studentId: (record: ImportRecord) => string,
  ): Promise<void> {
    const withGuardian = records.filter((r) => r.guardian);
    if (withGuardian.length === 0) return;
    const nameByPhone = new Map(
      withGuardian.map((r) => [r.guardian!.phone, r.guardian!.name]),
    );
    await this.insertChunked(
      m,
      GuardianEntity,
      [...nameByPhone].map(([phone, name]) => ({ institutionId, phone, name })),
      true,
    );
    const guardians = await m.find(GuardianEntity, {
      select: { id: true, phone: true },
      where: { phone: In([...nameByPhone.keys()]) },
    });
    const guardianIdByPhone = new Map(guardians.map((g) => [g.phone, g.id]));
    await this.insertChunked(
      m,
      StudentGuardianEntity,
      withGuardian.map((r) => ({
        institutionId,
        studentId: studentId(r),
        guardianId: guardianIdByPhone.get(r.guardian!.phone)!,
        relation: r.guardian!.relation,
        isPrimary: true,
      })),
      true,
    );
  }

  private async insertChunked<T extends ObjectLiteral>(
    m: EntityManager,
    entity: new () => T,
    values: QueryDeepPartialEntity<T>[],
    ignoreConflicts = false,
  ): Promise<void> {
    for (let i = 0; i < values.length; i += CHUNK_SIZE) {
      const query = m
        .createQueryBuilder()
        .insert()
        .into(entity)
        .values(values.slice(i, i + CHUNK_SIZE));
      await (ignoreConflicts ? query.orIgnore() : query).execute();
    }
  }
}
