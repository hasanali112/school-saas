import { Religion } from '@module/academics/domain/subject';
import { StudentStatus } from '../../../../domain/student';
import { StudentEntity } from '../entities/student.entity';
import { StudentMapper } from './student.mapper';

describe('StudentMapper', () => {
  it('fills optional columns with null so the insert never leaves them undefined', () => {
    const entity = StudentMapper.toPersistence({
      institutionId: 'inst-1',
      admissionNo: 'A-1',
      nameBn: 'ক',
      nameEn: 'Ka',
      religion: Religion.Islam,
    });
    expect(entity).toBeInstanceOf(StudentEntity);
    expect(entity.religion).toBe(Religion.Islam);
    expect(entity.dateOfBirth).toBeNull();
    // Columns with a database default stay unset, so Postgres fills them.
    expect(entity.status).toBeUndefined();
    expect(entity.id).toBeUndefined();
  });

  it('returns a plain domain object, not the entity', () => {
    const entity = StudentMapper.toPersistence({
      institutionId: 'inst-1',
      admissionNo: 'A-1',
      nameBn: 'ক',
      nameEn: 'Ka',
    });
    entity.id = 's1';
    entity.status = StudentStatus.Active;
    entity.photoKey = null;
    entity.exitedAt = null;
    entity.exitReason = null;
    entity.createdAt = new Date('2026-01-01');

    const student = StudentMapper.toDomain(entity);

    expect(student).not.toBeInstanceOf(StudentEntity);
    expect(student).toMatchObject({ id: 's1', status: StudentStatus.Active });
  });
});
