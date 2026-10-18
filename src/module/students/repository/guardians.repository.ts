import { Injectable } from '@nestjs/common';
import { In, Not } from 'typeorm';
import { DatabaseService } from '@common/services/database/database.service';
import type {
  GuardianChild,
  LinkedGuardian,
  LinkInput,
} from '../domain/guardian';
import { GuardiansRepositoryPort } from '../port/guardians.repository.port';
import {
  GUARDIAN_PHONE_CONFLICT,
  GuardianEntity,
} from './entities/guardian.entity';
import { StudentGuardianEntity } from './entities/student-guardian.entity';
import { StudentEntity } from './entities/student.entity';

@Injectable()
export class GuardiansRepository implements GuardiansRepositoryPort {
  constructor(private readonly db: DatabaseService) {}

  link(input: LinkInput): Promise<LinkedGuardian> {
    return this.db.tenant(async (m) => {
      const { institutionId, phone, name, studentId } = input;
      await m.upsert(
        GuardianEntity,
        { institutionId, phone, name },
        GUARDIAN_PHONE_CONFLICT,
      );
      const guardian = await m.findOneByOrFail(GuardianEntity, {
        institutionId,
        phone,
      });
      const link = await m.save(
        m.create(StudentGuardianEntity, {
          institutionId,
          studentId,
          guardianId: guardian.id,
          relation: input.relation,
          isPrimary: input.isPrimary,
        }),
      );
      if (input.isPrimary) {
        await m.update(
          StudentGuardianEntity,
          { studentId, id: Not(link.id) },
          { isPrimary: false },
        );
      }
      return { link, guardian };
    });
  }

  async unlink(studentId: string, guardianId: string): Promise<boolean> {
    const { affected } = await this.db.tenant((m) =>
      m.delete(StudentGuardianEntity, { studentId, guardianId }),
    );
    return !!affected;
  }

  findForStudent(studentId: string): Promise<LinkedGuardian[]> {
    return this.db.tenant(async (m) => {
      const links = await m.findBy(StudentGuardianEntity, { studentId });
      if (links.length === 0) return [];
      const guardians = await m.findBy(GuardianEntity, {
        id: In(links.map((l) => l.guardianId)),
      });
      const byId = new Map(guardians.map((g) => [g.id, g]));
      return links.flatMap((link) => {
        const guardian = byId.get(link.guardianId);
        return guardian ? [{ link, guardian }] : [];
      });
    });
  }

  findChildren(guardianId: string): Promise<GuardianChild[]> {
    return this.db.tenant(async (m) => {
      const links = await m.findBy(StudentGuardianEntity, { guardianId });
      if (links.length === 0) return [];
      const students = await m.findBy(StudentEntity, {
        id: In(links.map((l) => l.studentId)),
      });
      const byId = new Map(students.map((s) => [s.id, s]));
      return links.flatMap((link) => {
        const student = byId.get(link.studentId);
        return student ? [{ link, student }] : [];
      });
    });
  }
}
