import 'reflect-metadata';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import { PrismaClient, IdentityType, UserRole, UserStatus } from '@prisma/client';
import * as argon2 from 'argon2';

function normalizeCnic(value: string): string {
  return value.replace(/[\s-]/g, '');
}

async function seedAdmin(): Promise<void> {
  const cnic = process.env.ADMIN_CNIC ? normalizeCnic(process.env.ADMIN_CNIC) : '';
  const displayName = process.env.ADMIN_NAME?.trim() || '';
  const phone = process.env.ADMIN_PHONE?.trim() || '';
  const password = process.env.ADMIN_PASSWORD;

  if (!/^\d{13}$/.test(cnic)) {
    console.error('Set ADMIN_CNIC to a valid 13-digit CNIC before provisioning an administrator.');
    process.exitCode = 1;
    return;
  }
  if (!displayName || displayName.length > 120 || !password) {
    console.error('Set ADMIN_NAME (up to 120 characters) and ADMIN_PASSWORD before provisioning an administrator.');
    process.exitCode = 1;
    return;
  }

  const prisma = new PrismaClient();
  let stage = 'database lookup';

  try {
    const existingUser = await prisma.user.findUnique({ where: { cnic }, select: { id: true } });
    if (existingUser) {
      console.error('An account already uses this CNIC. No account or role changes were made.');
      process.exitCode = 1;
      return;
    }

    stage = 'administrator role setup';
    const adminRole = await prisma.role.upsert({
      where: { code: UserRole.ADMIN },
      update: { name: 'Platform Administrator' },
      create: {
        code: UserRole.ADMIN,
        name: 'Platform Administrator',
        description: 'Complete platform governance, moderation, and user oversight',
      },
    });

    stage = 'password hashing';
    const passwordHash = await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 4,
    });

    stage = 'account creation';
    await prisma.$transaction(async tx => {
      stage = 'user record creation';
      const user = await tx.user.create({
        data: {
          cnic,
          displayName,
          status: UserStatus.ACTIVE,
          preferredLocale: 'ur-PK',
        },
      });

      stage = 'CNIC login identity creation';
      await tx.userIdentity.create({
        data: {
          userId: user.id,
          identityType: IdentityType.CNIC,
          normalizedValue: cnic,
          passwordHash,
          isPrimary: true,
        },
      });

      if (phone) {
        stage = 'phone identity creation';
        await tx.userIdentity.create({
          data: {
            userId: user.id,
            identityType: IdentityType.PHONE,
            normalizedValue: phone,
            isPrimary: false,
          },
        });
      }

      stage = 'administrator role assignment';
      await tx.userRoleAssignment.create({
        data: {
          userId: user.id,
          roleId: adminRole.id,
        },
      });
    });

    console.log('Administrator account provisioned. Identity evidence remains unverified until independently reviewed.');
  } catch (error: unknown) {
    const code = error && typeof error === 'object' && 'code' in error && typeof error.code === 'string'
      ? error.code
      : 'UNKNOWN';
    const errorType = error instanceof Error ? error.name : 'UnknownError';
    console.error(`Failed to provision the administrator during ${stage} (${errorType}, code: ${code}). No CNIC or password details were logged.`);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

void seedAdmin();
