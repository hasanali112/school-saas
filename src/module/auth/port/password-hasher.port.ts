export abstract class PasswordHasherPort {
  abstract hash(plain: string): Promise<string>;
  /** False for a wrong password and for a malformed stored value; never throws. */
  abstract verify(plain: string, stored: string): Promise<boolean>;
}
