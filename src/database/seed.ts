import 'reflect-metadata';
import { randomUUID } from 'node:crypto';
import { ScryptPasswordHasher } from '@module/auth/infrastructure/adapters/scrypt.password-hasher';
import { Role } from '@common/types/role';
import { InstitutionEntity } from '@module/institutions/infrastructure/persistence/relational/entities/institution.entity';
import { UserEntity } from '@module/users/infrastructure/persistence/relational/entities/user.entity';
import dataSource from './data-source';

/**
 * Creates a demo institution and its head teacher so a fresh database can be logged into:
 *   SEED_PASSWORD=... yarn db:seed   →   slug "demo", phone 01700000000.
 * Runs as the owner role inside one tenant transaction, so RLS checks still apply.
 */
async function seed(): Promise<void> {
  const password = process.env.SEED_PASSWORD;
  if (!password || password.length < 8)
    throw new Error('Set SEED_PASSWORD (8+ characters) for the demo login');

  await dataSource.initialize();
  try {
    const institutionId = randomUUID();
    const passwordHash = await new ScryptPasswordHasher().hash(password);
    await dataSource.transaction(async (m) => {
      await m.query(`SELECT set_config('app.institution_id', $1, true)`, [
        institutionId,
      ]);
      await m.insert(InstitutionEntity, {
        id: institutionId,
        slug: 'demo',
        nameBn: 'ডেমো উচ্চ বিদ্যালয়',
        nameEn: 'Demo High School',
      });
      await m.insert(UserEntity, {
        institutionId,
        phone: '01700000000',
        name: 'Head Teacher',
        passwordHash,
        roles: [Role.InstituteHead],
      });
    });
    console.log(`Seeded institution "demo" (${institutionId})`);
  } finally {
    await dataSource.destroy();
  }
}

void seed().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
