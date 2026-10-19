import { Role } from '@common/types/role';

export enum UserStatus {
  Active = 'active',
  Disabled = 'disabled',
}

/** A person who signs in: staff, guardians, students. */
export interface User {
  id: string;
  institutionId: string;
  phone: string;
  name: string;
  /** Null for OTP-only accounts (guardians). */
  passwordHash: string | null;
  /** Array because one person often holds two roles. */
  roles: Role[];
  status: UserStatus;
  createdAt: Date;
}

export interface NewUser {
  institutionId: string;
  phone: string;
  name: string;
  passwordHash: string | null;
  roles: Role[];
}

/** What other modules (staff attendance) need to list active people. */
export interface StaffMember {
  userId: string;
  name: string;
}
