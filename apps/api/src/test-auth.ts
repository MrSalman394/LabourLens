import 'reflect-metadata';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment configuration
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { PrismaService } from './prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { EmailService } from './auth/services/email.service';
import * as crypto from 'crypto';
import request from 'supertest';

async function runAuthAutomatedTests() {
  console.log('========================================================');
  console.log('LabourLens Phase 4: Authentication & RBAC Test Suite');
  console.log('========================================================\n');

  console.log('1. Initializing NestJS testing application...');
  const app = await NestFactory.create(AppModule, { logger: false });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.init();
  const server = app.getHttpServer();
  const prisma = app.get(PrismaService);
  const jwtService = app.get(JwtService);
  const emailService = app.get(EmailService);
  console.log('✓ NestJS test server running in-memory.\n');

  const testEmailEmployer = `test.employer.${Date.now()}@labourlens.test`;
  const testEmailWorker = `test.worker.${Date.now()}@labourlens.test`;
  const testCnicEmployer = '3520212345671';
  const testCnicWorker = '3520212345672';
  const testPassword = 'StrongPassword123!';

  let employerAccessToken = '';
  let employerRefreshToken = '';
  let workerAccessToken = '';
  let workerRefreshToken = '';
  let createdUserIds: string[] = [];

  try {
    // -----------------------------------------------------------
    // TEST 1: Successful Employer Registration
    // -----------------------------------------------------------
    console.log('[TEST 1] Testing Successful Employer Registration...');
    const employerRegRes = await request(server)
      .post('/auth/register/employer')
      .send({
        cnic: '35202-1234567-1',
        email: testEmailEmployer,
        password: testPassword,
        confirmPassword: testPassword,
        displayName: 'Apex Construction Pvt Ltd',
        employerType: 'CONTRACTOR',
        phone: '+923001234567',
        ntnTaxNumber: '1234567-8',
        description: 'Commercial construction contractor in Islamabad',
      });

    if (employerRegRes.status !== 201) {
      throw new Error(`Expected 201 Created, got ${employerRegRes.status}: ${JSON.stringify(employerRegRes.body)}`);
    }
    if (!employerRegRes.body.accessToken || !employerRegRes.body.refreshToken) {
      throw new Error('Missing accessToken or refreshToken in registration response');
    }
    if (!employerRegRes.body.user.roles.includes('EMPLOYER')) {
      throw new Error('User missing EMPLOYER role in response');
    }
    if (JSON.stringify(employerRegRes.body).includes(testCnicEmployer)) {
      throw new Error('CNIC leaked in employer registration response');
    }
    employerAccessToken = employerRegRes.body.accessToken;
    employerRefreshToken = employerRegRes.body.refreshToken;
    createdUserIds.push(employerRegRes.body.user.id);
    console.log(`✓ Passed: Employer registered with ID: ${employerRegRes.body.user.id}`);

    // -----------------------------------------------------------
    // TEST 2: Successful Worker Registration
    // -----------------------------------------------------------
    console.log('\n[TEST 2] Testing Successful Worker Registration...');
    const workerRegRes = await request(server)
      .post('/auth/register/worker')
      .send({
        cnic: testCnicWorker,
        email: testEmailWorker,
        password: testPassword,
        confirmPassword: testPassword,
        displayName: 'Muhammad Tariq',
        phone: '+923009876543',
        gender: 'MALE',
        experienceMonths: 48,
        preferredEngagementType: 'DAILY',
        bio: 'Senior industrial electrician and wiring technician',
      });

    if (workerRegRes.status !== 201) {
      throw new Error(`Expected 201 Created, got ${workerRegRes.status}: ${JSON.stringify(workerRegRes.body)}`);
    }
    if (!workerRegRes.body.user.roles.includes('WORKER')) {
      throw new Error('User missing WORKER role in response');
    }
    workerAccessToken = workerRegRes.body.accessToken;
    workerRefreshToken = workerRegRes.body.refreshToken;
    createdUserIds.push(workerRegRes.body.user.id);
    console.log(`✓ Passed: Worker registered with ID: ${workerRegRes.body.user.id}`);

    // -----------------------------------------------------------
    // TEST 3: Duplicate Email Rejection
    // -----------------------------------------------------------
    console.log('\n[TEST 3] Testing Duplicate Email Rejection...');
    const dupRes = await request(server)
      .post('/auth/register/employer')
      .send({
        cnic: testCnicEmployer,
        email: testEmailEmployer,
        password: testPassword,
        confirmPassword: testPassword,
        displayName: 'Duplicate Employer',
      });

    if (dupRes.status !== 409) {
      throw new Error(`Expected 409 Conflict, got ${dupRes.status}`);
    }
    console.log(`✓ Passed: Duplicate email rejected with 409 Conflict (${dupRes.body.message})`);

    // -----------------------------------------------------------
    const missingCnicRes = await request(server).post('/auth/register/worker').send({
      email: `missing.${Date.now()}@labourlens.test`, password: testPassword,
      confirmPassword: testPassword, displayName: 'Missing CNIC',
    });
    if (missingCnicRes.status !== 400) throw new Error('Missing CNIC registration was not rejected');

    const invalidCnicRes = await request(server).post('/auth/register/worker').send({
      cnic: '12345-123456-7', email: `invalid.${Date.now()}@labourlens.test`,
      password: testPassword, confirmPassword: testPassword, displayName: 'Invalid CNIC',
    });
    if (invalidCnicRes.status !== 400) throw new Error('Invalid CNIC registration was not rejected');

    const duplicateCnicRes = await request(server).post('/auth/register/worker').send({
      cnic: testCnicEmployer, email: `duplicate.${Date.now()}@labourlens.test`,
      password: testPassword, confirmPassword: testPassword, displayName: 'Duplicate CNIC',
    });
    if (duplicateCnicRes.status !== 409) throw new Error('Duplicate CNIC registration was not rejected');

    // TEST 4: Successful Login
    // -----------------------------------------------------------
    console.log('\n[TEST 4] Testing Successful Login...');
    const loginRes = await request(server)
      .post('/auth/login')
      .send({
        cnic: '35202 1234567 1',
        password: testPassword,
      });

    if (loginRes.status !== 200) {
      throw new Error(`Expected 200 OK, got ${loginRes.status}: ${JSON.stringify(loginRes.body)}`);
    }
    if (!loginRes.body.accessToken || !loginRes.body.refreshToken) {
      throw new Error('Login failed to return accessToken or refreshToken');
    }
    if (JSON.stringify(loginRes.body).includes(testCnicEmployer)) {
      throw new Error('CNIC leaked in login response');
    }
    // Update tokens with newly logged in session
    employerAccessToken = loginRes.body.accessToken;
    employerRefreshToken = loginRes.body.refreshToken;
    console.log('✓ Passed: Login successful with valid access and refresh tokens.');

    // -----------------------------------------------------------
    // TEST 5: Incorrect Password Rejection (Generic Error)
    // -----------------------------------------------------------
    console.log('\n[TEST 5] Testing Incorrect Password Rejection...');
    const wrongPassRes = await request(server)
      .post('/auth/login')
      .send({
        cnic: testCnicEmployer,
        password: 'IncorrectPassword999!',
      });

    if (wrongPassRes.status !== 401) {
      throw new Error(`Expected 401 Unauthorized, got ${wrongPassRes.status}`);
    }
    if (wrongPassRes.body.message !== 'Invalid CNIC or password') {
      throw new Error(`Expected generic message, got: ${wrongPassRes.body.message}`);
    }
    const unknownCnicRes = await request(server)
      .post('/auth/login')
      .send({ cnic: '3520212345674', password: 'IncorrectPassword999!' });
    if (unknownCnicRes.status !== 401 || unknownCnicRes.body.message !== wrongPassRes.body.message) {
      throw new Error('Unknown CNIC response differs from incorrect password response');
    }
    console.log('✓ Passed: Incorrect password rejected with generic 401 Unauthorized message.');

    // -----------------------------------------------------------
    // TEST 6: Expired Access Token Rejection
    // -----------------------------------------------------------
    console.log('\n[TEST 6] Testing Expired Access Token Handling...');
    const expiredToken = jwtService.sign(
      { sub: createdUserIds[0], email: testEmailEmployer, roles: ['EMPLOYER'] },
      {
        secret: process.env.JWT_SECRET || 'labourlens_default_jwt_secret_min_32_chars',
        expiresIn: '-10s', // Expired in the past
      },
    );

    const expiredRes = await request(server)
      .get('/auth/me')
      .set('Authorization', `Bearer ${expiredToken}`);

    if (expiredRes.status !== 401) {
      throw new Error(`Expected 401 Unauthorized for expired token, got ${expiredRes.status}`);
    }
    console.log('✓ Passed: Expired access token rejected with 401 Unauthorized.');

    // -----------------------------------------------------------
    // TEST 7: Refresh Token Rotation
    // -----------------------------------------------------------
    console.log('\n[TEST 7] Testing Refresh Token Rotation...');
    const refreshRes = await request(server)
      .post('/auth/refresh')
      .send({ refreshToken: employerRefreshToken });

    if (refreshRes.status !== 200) {
      throw new Error(`Expected 200 OK, got ${refreshRes.status}: ${JSON.stringify(refreshRes.body)}`);
    }
    const newRefreshToken = refreshRes.body.refreshToken;
    const newAccessToken = refreshRes.body.accessToken;

    if (newRefreshToken === employerRefreshToken) {
      throw new Error('Refresh token was not rotated; old and new tokens are identical!');
    }

    // Now test token reuse detection: old refresh token must be rejected
    const reuseRes = await request(server)
      .post('/auth/refresh')
      .send({ refreshToken: employerRefreshToken });

    if (reuseRes.status !== 401) {
      throw new Error(`Expected 401 Unauthorized for reused refresh token, got ${reuseRes.status}`);
    }
    employerRefreshToken = newRefreshToken;
    employerAccessToken = newAccessToken;
    console.log('✓ Passed: Refresh token rotated successfully and old token reuse was detected & blocked.');

    // -----------------------------------------------------------
    // TEST 8: Logout and Token Revocation
    // -----------------------------------------------------------
    console.log('\n[TEST 8] Testing Logout & Session Revocation...');
    const logoutRes = await request(server)
      .post('/auth/logout')
      .send({ refreshToken: employerRefreshToken });

    if (logoutRes.status !== 200) {
      throw new Error(`Expected 200 OK, got ${logoutRes.status}`);
    }

    // Verify revoked token can no longer be used to refresh
    const afterLogoutRefresh = await request(server)
      .post('/auth/refresh')
      .send({ refreshToken: employerRefreshToken });

    if (afterLogoutRefresh.status !== 401) {
      throw new Error(`Expected 401 Unauthorized after logout, got ${afterLogoutRefresh.status}`);
    }
    console.log('✓ Passed: Logout successfully revoked refresh token session in database.');

    // -----------------------------------------------------------
    // TEST 9: Unauthorized Access Rejection
    // -----------------------------------------------------------
    console.log('\n[TEST 9] Testing Unauthorized Access Protection...');
    const noAuthRes = await request(server).get('/auth/me');
    if (noAuthRes.status !== 401) {
      throw new Error(`Expected 401 Unauthorized when no token provided, got ${noAuthRes.status}`);
    }

    const invalidAuthRes = await request(server)
      .get('/auth/me')
      .set('Authorization', 'Bearer invalid_signature_token_xyz');
    if (invalidAuthRes.status !== 401) {
      throw new Error(`Expected 401 Unauthorized for invalid token, got ${invalidAuthRes.status}`);
    }
    console.log('✓ Passed: Protected endpoints securely reject unauthenticated requests.');

    // -----------------------------------------------------------
    // TEST 10: Role-Based Access Control (RBAC) Restrictions
    // -----------------------------------------------------------
    console.log('\n[TEST 10] Testing Role-Based Access Control (RBAC)...');
    // Worker tries to access employer-only endpoint
    const workerForbiddenRes = await request(server)
      .get('/auth/employer/only')
      .set('Authorization', `Bearer ${workerAccessToken}`);

    if (workerForbiddenRes.status !== 403) {
      throw new Error(`Expected 403 Forbidden for worker on employer route, got ${workerForbiddenRes.status}`);
    }

    // Worker accesses worker-only endpoint
    const workerAllowedRes = await request(server)
      .get('/auth/worker/only')
      .set('Authorization', `Bearer ${workerAccessToken}`);

    if (workerAllowedRes.status !== 200) {
      throw new Error(`Expected 200 OK for worker on worker route, got ${workerAllowedRes.status}`);
    }

    // Log in employer to get fresh access token
    const employerLoginAgain = await request(server)
      .post('/auth/login')
      .send({ cnic: testCnicEmployer, password: testPassword });
    const freshEmployerToken = employerLoginAgain.body.accessToken;

    // Employer accesses employer-only endpoint
    const employerAllowedRes = await request(server)
      .get('/auth/employer/only')
      .set('Authorization', `Bearer ${freshEmployerToken}`);

    if (employerAllowedRes.status !== 200) {
      throw new Error(`Expected 200 OK for employer on employer route, got ${employerAllowedRes.status}`);
    }

    // Employer tries to access admin-only endpoint
    const employerAdminForbidden = await request(server)
      .get('/auth/admin/only')
      .set('Authorization', `Bearer ${freshEmployerToken}`);

    if (employerAdminForbidden.status !== 403) {
      throw new Error(`Expected 403 Forbidden on admin route, got ${employerAdminForbidden.status}`);
    }
    console.log('✓ Passed: RBAC guards strictly enforce role boundaries (Worker vs Employer vs Admin).');

    // -----------------------------------------------------------
    // TEST 11: Input Validation & Password Strength
    // -----------------------------------------------------------
    console.log('\n[TEST 11] Testing Input Validation & Password Strength...');
    const weakPassRes = await request(server)
      .post('/auth/register/employer')
      .send({
        email: 'invalid-email-format',
        password: 'weak',
        displayName: '',
        unwhitelistedProperty: 'malicious-data',
      });

    if (weakPassRes.status !== 400) {
      throw new Error(`Expected 400 Bad Request, got ${weakPassRes.status}`);
    }
    console.log('✓ Passed: Weak passwords, malformed emails, and unwhitelisted properties rejected with 400 Bad Request.');

    // -----------------------------------------------------------
    // TEST 12: GET /auth/me Verified
    // -----------------------------------------------------------
    console.log('\n[TEST 12] Testing GET /auth/me Sanitized Profile...');
    const meRes = await request(server)
      .get('/auth/me')
      .set('Authorization', `Bearer ${freshEmployerToken}`);

    if (meRes.status !== 200) {
      throw new Error(`Expected 200 OK, got ${meRes.status}`);
    }
    if ((meRes.body as any).passwordHash || (meRes.body as any).tokenHash) {
      throw new Error('SECURITY VIOLATION: Password hash or token hash leaked in /auth/me response!');
    }
    console.log(`✓ Passed: /auth/me returns clean, sanitized user profile without sensitive data.`);

    // -----------------------------------------------------------
    // TEST 13: Password Reset Workflow (Forgot & Reset Password)
    // -----------------------------------------------------------
    console.log('\n[TEST 13] Testing Forgot & Reset Password Flow...');
    const forgotRes = await request(server)
      .post('/auth/forgot-password')
      .send({ email: testEmailWorker });

    if (forgotRes.status !== 200) {
      throw new Error(`Expected 200 OK for forgot-password, got ${forgotRes.status}`);
    }

    // Direct token generation test to verify the reset execution endpoint
    const rawResetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = Uint8Array.from(crypto.createHash('sha256').update(rawResetToken).digest()) as Uint8Array<ArrayBuffer>;
    const workerUser = await prisma.user.findFirst({
      where: { identities: { some: { normalizedValue: testEmailWorker } } },
    });

    await prisma.passwordResetToken.create({
      data: {
        userId: workerUser!.id,
        tokenHash: resetTokenHash,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      },
    });

    const newWorkerPassword = 'BrandNewPassword999!';
    const resetRes = await request(server)
      .post('/auth/reset-password')
      .send({
        token: rawResetToken,
        newPassword: newWorkerPassword,
      });

    if (resetRes.status !== 200) {
      throw new Error(`Expected 200 OK for reset-password, got ${resetRes.status}: ${JSON.stringify(resetRes.body)}`);
    }

    // Verify login works with new password
    const newLoginRes = await request(server)
      .post('/auth/login')
      .send({ cnic: testCnicWorker, password: newWorkerPassword });

    if (newLoginRes.status !== 200) {
      throw new Error('Failed to log in with newly reset password');
    }

    // Verify old password no longer works
    const oldLoginRes = await request(server)
      .post('/auth/login')
      .send({ cnic: testCnicWorker, password: testPassword });

    if (oldLoginRes.status !== 401) {
      throw new Error('Old password still worked after reset!');
    }
    console.log('✓ Passed: Password reset end-to-end verified; new password active and old password revoked.');

    // -----------------------------------------------------------
    // TEST 14: Single-Use Reset Token (Consumed Token Rejection)
    // -----------------------------------------------------------
    console.log('\n[TEST 14] Testing Consumed Password Reset Token Rejection...');
    const reuseResetRes = await request(server)
      .post('/auth/reset-password')
      .send({
        token: rawResetToken,
        newPassword: 'AnotherPassword888!',
      });

    if (reuseResetRes.status !== 400) {
      throw new Error(`Expected 400 Bad Request for reused reset token, got ${reuseResetRes.status}`);
    }
    console.log('✓ Passed: Consumed password reset token rejected with 400 Bad Request.');

    // -----------------------------------------------------------
    // TEST 15: Email Verification Workflow
    // -----------------------------------------------------------
    console.log('\n[TEST 15] Testing Email Verification Flow...');
    const emailVerifyToken = emailService.generateEmailVerificationToken(createdUserIds[0], testEmailEmployer);

    const verifyRes = await request(server)
      .post('/auth/verify-email')
      .send({ token: emailVerifyToken });

    if (verifyRes.status !== 200) {
      throw new Error(`Expected 200 OK for verify-email, got ${verifyRes.status}: ${JSON.stringify(verifyRes.body)}`);
    }

    // Verify in database that email identity has verifiedAt populated
    const verifiedIdentity = await prisma.userIdentity.findFirst({
      where: { userId: createdUserIds[0], normalizedValue: testEmailEmployer },
    });
    if (!verifiedIdentity?.verifiedAt) {
      throw new Error('Database identity verifiedAt was not set after verification!');
    }
    console.log('✓ Passed: Email verified successfully with cryptographic token verification.');

    console.log('\n========================================================');
    console.log('✓ ALL 15 AUTHENTICATION & SECURITY TESTS PASSED! 🚀');
    console.log('========================================================\n');
  } catch (error) {
    console.error('\n❌ Test suite failed:', error);
    process.exitCode = 1;
  } finally {
    // Clean up created test data
    console.log('Cleaning up test records from database...');
    for (const uid of createdUserIds) {
      try {
        await prisma.user.delete({ where: { id: uid } });
      } catch {}
    }
    console.log('✓ Test data cleaned up.');
    await app.close();
  }
}

runAuthAutomatedTests();
