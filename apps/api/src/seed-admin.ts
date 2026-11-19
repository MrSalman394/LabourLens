import 'reflect-metadata';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import { PrismaClient, UserStatus, IdentityType, UserRole } from '@prisma/client';
import * as argon2 from 'argon2';

async function seedAdmin() {
  const adminEmail = process.env.ADMIN_EMAIL?.trim();
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminEmail || !adminPassword) {
    console.error('Set ADMIN_EMAIL and ADMIN_PASSWORD in the API environment before provisioning an administrator.');
    process.exitCode = 1;
    return;
  }

  const prisma = new PrismaClient();
  const normalizedEmail = adminEmail.toLowerCase().trim();

  console.log(`====================================================`);
  console.log(`LabourLens Secure Administrative Provisioning`);
  console.log(`====================================================`);
  console.log(`Provisioning Admin Account: ${normalizedEmail}`);

  try {
    // Ensure ADMIN role exists
    const adminRole = await prisma.role.upsert({
      where: { code: UserRole.ADMIN },
      update: { name: 'Platform Administrator' },
      create: {
        code: UserRole.ADMIN,
        name: 'Platform Administrator',
        description: 'Complete platform governance, moderation, and user oversight',
      },
    });

    // Check if user identity already exists
    let identity = await prisma.userIdentity.findUnique({
      where: { normalizedValue: normalizedEmail },
      include: { user: true },
    });

    const passwordHash = await argon2.hash(adminPassword, {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 4,
    });

    if (identity) {
      console.log(`Existing user found with ID: ${identity.userId}. Updating password and verifying role...`);
      await prisma.userIdentity.update({
        where: { id: identity.id },
        data: {
          passwordHash,
          verifiedAt: new Date(),
        },
      });

      // Ensure ADMIN role assignment exists
      const existingAssignment = await prisma.userRoleAssignment.findUnique({
        where: {
          userId_roleId: {
            userId: identity.userId,
            roleId: adminRole.id,
          },
        },
      });

      if (!existingAssignment) {
        await prisma.userRoleAssignment.create({
          data: {
            userId: identity.userId,
            roleId: adminRole.id,
          },
        });
      }
      console.log(`✓ Admin credentials and ADMIN role assignment confirmed for: ${normalizedEmail}`);
    } else {
      // Create user within atomic transaction
      const newUser = await prisma.$transaction(async tx => {
        const user = await tx.user.create({
          data: {
            status: UserStatus.ACTIVE,
            preferredLocale: 'ur-PK',
          },
        });

        await tx.userIdentity.create({
          data: {
            userId: user.id,
            identityType: IdentityType.EMAIL,
            normalizedValue: normalizedEmail,
            passwordHash,
            isPrimary: true,
            verifiedAt: new Date(),
          },
        });

        await tx.userRoleAssignment.create({
          data: {
            userId: user.id,
            roleId: adminRole.id,
          },
        });

        return user;
      });

      console.log(`✓ Admin user successfully provisioned with ID: ${newUser.id}`);
    }

    console.log(`✓ Admin account is active and ready for administrative login.`);
    console.log(`====================================================\n`);
  } catch (error) {
    console.error('❌ Failed to provision admin account:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedAdmin();
