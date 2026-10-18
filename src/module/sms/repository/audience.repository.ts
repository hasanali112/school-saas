import { Injectable } from '@nestjs/common';
import { ArrayOverlap } from 'typeorm';
import { DatabaseService } from '@common/services/database/database.service';
import { SchoolClassEntity } from '@module/academics/repository/entities/school-class.entity';
import { SectionEntity } from '@module/academics/repository/entities/section.entity';
import type { Role } from '@module/auth/domain/role';
import { ConsentPurpose } from '@module/consent/domain/consent';
import { ConsentEntity } from '@module/consent/repository/entities/consent.entity';
import { StudentStatus } from '@module/students/domain/student';
import { EnrolmentEntity } from '@module/students/repository/entities/enrolment.entity';
import { GuardianEntity } from '@module/students/repository/entities/guardian.entity';
import { StudentGuardianEntity } from '@module/students/repository/entities/student-guardian.entity';
import { StudentEntity } from '@module/students/repository/entities/student.entity';
import { UserStatus } from '@module/users/domain/user';
import { UserEntity } from '@module/users/repository/entities/user.entity';
import type {
  GuardianFilter,
  GuardianRecipient,
  StaffRecipient,
} from '../domain/audience';
import { AudienceRepositoryPort } from '../port/audience.repository.port';

/**
 * A read model across modules (students, academics, consent, users): one query
 * instead of a facade call per student. It only reads those tables, never writes them.
 */
@Injectable()
export class AudienceRepository implements AudienceRepositoryPort {
  constructor(private readonly db: DatabaseService) {}

  findGuardianRecipients(filter: GuardianFilter): Promise<GuardianRecipient[]> {
    if (filter.studentIds?.length === 0) return Promise.resolve([]);
    return this.db.tenant((m) => {
      const query = m
        .createQueryBuilder(EnrolmentEntity, 'e')
        .innerJoin(StudentEntity, 's', 's.id = e.studentId')
        .innerJoin(SectionEntity, 'sec', 'sec.id = e.sectionId')
        .innerJoin(SchoolClassEntity, 'c', 'c.id = sec.classId')
        .innerJoin(StudentGuardianEntity, 'sg', 'sg.studentId = s.id')
        .innerJoin(GuardianEntity, 'g', 'g.id = sg.guardianId')
        .leftJoin(
          ConsentEntity,
          'cn',
          'cn.guardianId = g.id AND cn.purpose = :purpose',
          { purpose: ConsentPurpose.Sms },
        )
        .select('s.id', 'studentId')
        .addSelect('s.nameBn', 'studentNameBn')
        .addSelect('s.nameEn', 'studentNameEn')
        .addSelect('e.rollNo', 'rollNo')
        .addSelect('c.name', 'className')
        .addSelect('sec.name', 'sectionName')
        .addSelect('g.id', 'guardianId')
        .addSelect('g.name', 'guardianName')
        .addSelect('g.phone', 'phone')
        .addSelect('cn.granted', 'smsConsent')
        .where('e.sessionId = :sessionId', { sessionId: filter.sessionId })
        .andWhere('s.status = :active', { active: StudentStatus.Active })
        .andWhere('sg.isPrimary = true');
      if (filter.sectionId)
        query.andWhere('e.sectionId = :sectionId', {
          sectionId: filter.sectionId,
        });
      if (filter.classId)
        query.andWhere('sec.classId = :classId', { classId: filter.classId });
      if (filter.studentIds)
        query.andWhere('e.studentId IN (:...studentIds)', {
          studentIds: filter.studentIds,
        });
      return query
        .orderBy('c.ordinal')
        .addOrderBy('sec.name')
        .addOrderBy('e.rollNo')
        .getRawMany<GuardianRecipient>();
    });
  }

  async findStaffRecipients(roles: readonly Role[]): Promise<StaffRecipient[]> {
    const rows = await this.db.tenant((m) =>
      m.find(UserEntity, {
        select: { id: true, name: true, phone: true },
        where: { status: UserStatus.Active, roles: ArrayOverlap([...roles]) },
        order: { name: 'ASC' },
      }),
    );
    return rows.map((u) => ({ userId: u.id, name: u.name, phone: u.phone }));
  }
}
