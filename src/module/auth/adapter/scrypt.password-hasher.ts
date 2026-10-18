import { Injectable } from '@nestjs/common';
import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { PasswordHasherPort } from '../port/password-hasher.port';

const KEY_LENGTH = 64;
const SALT_LENGTH = 16;
const SCRYPT_COST = 16_384;
const FORMAT = 'scrypt';

/** Built-in scrypt: no native addon to compile, constant-time compare, versioned format. */
@Injectable()
export class ScryptPasswordHasher implements PasswordHasherPort {
  async hash(plain: string): Promise<string> {
    const salt = randomBytes(SALT_LENGTH).toString('hex');
    const key = await this.derive(plain, salt, KEY_LENGTH, SCRYPT_COST);
    return `${FORMAT}$${SCRYPT_COST}$${salt}$${key.toString('hex')}`;
  }

  async verify(plain: string, stored: string): Promise<boolean> {
    const [format, cost, salt, hex] = stored.split('$');
    if (format !== FORMAT || !cost || !salt || !hex) return false;
    const expected = Buffer.from(hex, 'hex');
    const actual = await this.derive(
      plain,
      salt,
      expected.length,
      Number(cost),
    );
    return (
      actual.length === expected.length && timingSafeEqual(actual, expected)
    );
  }

  private derive(
    password: string,
    salt: string,
    keyLength: number,
    cost: number,
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      scrypt(password, salt, keyLength, { N: cost }, (error, key) =>
        error ? reject(error) : resolve(key),
      );
    });
  }
}
