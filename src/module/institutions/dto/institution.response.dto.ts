import type { Institution } from '../domain/institution';

export class InstitutionResponseDto {
  readonly id: string;
  readonly slug: string;
  readonly nameBn: string;
  readonly nameEn: string;
  readonly eiin: string | null;
  readonly addressBn: string | null;
  readonly addressEn: string | null;
  readonly phone: string | null;

  private constructor(row: Institution) {
    this.id = row.id;
    this.slug = row.slug;
    this.nameBn = row.nameBn;
    this.nameEn = row.nameEn;
    this.eiin = row.eiin;
    this.addressBn = row.addressBn;
    this.addressEn = row.addressEn;
    this.phone = row.phone;
  }

  static from(row: Institution): InstitutionResponseDto {
    return new InstitutionResponseDto(row);
  }
}
