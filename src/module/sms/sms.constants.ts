import { Role } from '@modules/auth/roles';

/** Who may compose, send and read the SMS log. */
export const SMS_OPERATORS = [Role.InstituteHead, Role.AdminOfficer];
/** Who may put money on the balance (billing integration replaces this in F1-01). */
export const SMS_BALANCE_MANAGERS = [Role.InstituteHead];
