/** A tenant: one school or college. Every other table hangs off its id. */
export interface Institution {
  id: string;
  /** URL-safe identifier used on the public website and at login to pick the tenant. */
  slug: string;
  nameBn: string;
  nameEn: string;
  eiin: string | null;
  addressBn: string | null;
  addressEn: string | null;
  phone: string | null;
  createdAt: Date;
}

export interface InstitutionPatch {
  nameBn?: string;
  nameEn?: string;
  eiin?: string;
  addressBn?: string;
  addressEn?: string;
  phone?: string;
}
