import type { NewStudent, Student } from '../../../../domain/student';
import { StudentEntity } from '../entities/student.entity';

/** Converts between the `Student` domain type and its TypeORM row. */
export class StudentMapper {
  static toDomain(entity: StudentEntity): Student {
    return {
      id: entity.id,
      institutionId: entity.institutionId,
      admissionNo: entity.admissionNo,
      nameBn: entity.nameBn,
      nameEn: entity.nameEn,
      dateOfBirth: entity.dateOfBirth,
      gender: entity.gender,
      bloodGroup: entity.bloodGroup,
      religion: entity.religion,
      birthCertificateNo: entity.birthCertificateNo,
      addressBn: entity.addressBn,
      addressEn: entity.addressEn,
      photoKey: entity.photoKey,
      status: entity.status,
      exitedAt: entity.exitedAt,
      exitReason: entity.exitReason,
      createdAt: entity.createdAt,
    };
  }

  static toPersistence(data: NewStudent): StudentEntity {
    const entity = new StudentEntity();
    entity.admissionNo = data.admissionNo;
    entity.nameBn = data.nameBn;
    entity.nameEn = data.nameEn;
    entity.dateOfBirth = data.dateOfBirth ?? null;
    entity.gender = data.gender ?? null;
    entity.bloodGroup = data.bloodGroup ?? null;
    entity.religion = data.religion ?? null;
    entity.birthCertificateNo = data.birthCertificateNo ?? null;
    entity.addressBn = data.addressBn ?? null;
    entity.addressEn = data.addressEn ?? null;
    entity.institutionId = data.institutionId;
    return entity;
  }
}
