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
import request from 'supertest';

async function runProfileAutomatedTests() {
  console.log('========================================================');
  console.log('LabourLens Phase 5: Profile Management Test Suite');
  console.log('========================================================\n');

  console.log('1. Initializing NestJS testing application...');
  const app = await NestFactory.create(AppModule, { logger: ['error', 'warn'] });

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
  console.log('✓ NestJS test server running in-memory.\n');

  const testWorkerEmail = `worker.profile.${Date.now()}@labourlens.test`;
  const testWorker2Email = `worker2.profile.${Date.now()}@labourlens.test`;
  const testEmployerEmail = `employer.profile.${Date.now()}@labourlens.test`;
  const testPassword = 'StrongPassword123!';

  let workerToken = '';
  let worker2Token = '';
  let employerToken = '';
  let workerUserId = '';
  let worker2UserId = '';
  let employerUserId = '';
  let workerProfileId = '';
  let employerProfileId = '';
  const createdUserIds: string[] = [];

  try {
    // -----------------------------------------------------------
    // SETUP: Register Worker and Employer accounts
    // -----------------------------------------------------------
    console.log('[SETUP] Registering test Worker and Employer...');
    const workerReg = await request(server).post('/auth/register/worker').send({
      cnic: '3520312345671',
      email: testWorkerEmail,
      password: testPassword,
      confirmPassword: testPassword,
      displayName: 'Tariq Mehmood',
      phone: '+923001112233',
      gender: 'MALE',
      experienceMonths: 36,
      preferredEngagementType: 'DAILY',
      bio: 'Initial basic bio for electrician work',
    });
    workerToken = workerReg.body.accessToken;
    workerUserId = workerReg.body.user.id;
    workerProfileId = workerReg.body.user.workerProfile.id;
    createdUserIds.push(workerUserId);

    const worker2Reg = await request(server).post('/auth/register/worker').send({
      cnic: '3520312345672',
      email: testWorker2Email,
      password: testPassword,
      confirmPassword: testPassword,
      displayName: 'Second Worker',
    });
    worker2Token = worker2Reg.body.accessToken;
    worker2UserId = worker2Reg.body.user.id;
    createdUserIds.push(worker2UserId);

    const employerReg = await request(server).post('/auth/register/employer').send({
      cnic: '3520312345673',
      email: testEmployerEmail,
      password: testPassword,
      confirmPassword: testPassword,
      displayName: 'Kashif Builders',
      employerType: 'CONTRACTOR',
      phone: '+923004445566',
    });
    employerToken = employerReg.body.accessToken;
    employerUserId = employerReg.body.user.id;
    employerProfileId = employerReg.body.user.employerProfile.id;
    createdUserIds.push(employerUserId);
    console.log('✓ Worker and Employer registered successfully.\n');

    // -----------------------------------------------------------
    // TEST 1: Fetch Worker Profile & Completion Score
    // -----------------------------------------------------------
    console.log('[TEST 1] Testing GET /workers/profile/me...');
    const workerProfileRes = await request(server)
      .get('/workers/profile/me')
      .set('Authorization', `Bearer ${workerToken}`);

    if (workerProfileRes.status !== 200) {
      throw new Error(`Expected 200 OK, got ${workerProfileRes.status}: ${JSON.stringify(workerProfileRes.body)}`);
    }
    const profileData = workerProfileRes.body;
    if (!profileData.profile || !profileData.completion) {
      throw new Error('Profile response missing profile or completion object');
    }
    console.log(`✓ Passed: Worker profile fetched. Initial Completion: ${profileData.completion.percentage}%`);

    // -----------------------------------------------------------
    // TEST 2: Update Worker Personal & Professional Info
    // -----------------------------------------------------------
    console.log('\n[TEST 2] Testing PATCH /workers/profile/me...');
    const updateWorkerRes = await request(server)
      .patch('/workers/profile/me')
      .set('Authorization', `Bearer ${workerToken}`)
      .send({
        headline: 'Master Industrial & Residential Electrician',
        bio: 'Certified industrial electrician with 10+ years hands-on experience in 3-phase wiring and solar systems.',
        dateOfBirth: '1992-05-15',
        expectedWageDailyMinor: 3500,
        expectedWageHourlyMinor: 600,
        languages: ['ur-PK', 'en-US', 'pa-PK'],
        availabilityStatus: 'AVAILABLE',
      });

    if (updateWorkerRes.status !== 200) {
      throw new Error(`Expected 200 OK, got ${updateWorkerRes.status}: ${JSON.stringify(updateWorkerRes.body)}`);
    }
    const updatedWorker = updateWorkerRes.body.profile;
    if (updatedWorker.headline !== 'Master Industrial & Residential Electrician') {
      throw new Error('Headline was not updated correctly');
    }
    if (updatedWorker.expectedWageDailyMinor !== 3500) {
      throw new Error('Expected daily wage was not updated');
    }
    console.log(`✓ Passed: Worker profile updated. New Completion: ${updateWorkerRes.body.completion.percentage}%`);

    // -----------------------------------------------------------
    // TEST 3: Skills Management
    // -----------------------------------------------------------
    console.log('\n[TEST 3] Testing Taxonomy & PUT /workers/profile/me/skills...');
    const skillsRes = await request(server).get('/taxonomy/skills');
    if (skillsRes.status !== 200 || skillsRes.body.length === 0) {
      throw new Error('Failed to retrieve taxonomy skills');
    }
    const skill1 = skillsRes.body[0];
    const skill2 = skillsRes.body[1];
    const skill3 = skillsRes.body[2];

    const updateSkillsRes = await request(server)
      .put('/workers/profile/me/skills')
      .set('Authorization', `Bearer ${workerToken}`)
      .send({
        skills: [
          { skillId: skill1.id, proficiencyLevel: 5, experienceMonths: 48 },
          { skillId: skill2.id, proficiencyLevel: 4, experienceMonths: 36 },
          { skillId: skill3.id, proficiencyLevel: 4, experienceMonths: 24 },
        ],
      });

    if (updateSkillsRes.status !== 200) {
      throw new Error(`Expected 200 OK, got ${updateSkillsRes.status}`);
    }
    if (updateSkillsRes.body.profile.skills.length !== 3) {
      throw new Error(`Expected 3 skills, got ${updateSkillsRes.body.profile.skills.length}`);
    }
    console.log('✓ Passed: Worker skills updated with proficiency levels and experience.');

    // -----------------------------------------------------------
    // TEST 4: Work Experience Management (CRUD)
    // -----------------------------------------------------------
    console.log('\n[TEST 4] Testing Worker Experience Management (CRUD)...');
    const addExpRes = await request(server)
      .post('/workers/profile/me/experiences')
      .set('Authorization', `Bearer ${workerToken}`)
      .send({
        roleTitle: 'Lead Electrical Technician',
        employerName: 'Descon Engineering',
        city: 'Lahore',
        startedOn: '2020-01-01',
        endedOn: '2023-12-31',
        isCurrent: false,
        description: 'Supervised industrial wiring and switchgear installation.',
      });

    if (addExpRes.status !== 201) {
      throw new Error(`Expected 201 Created for experience, got ${addExpRes.status}`);
    }
    const expId = addExpRes.body.id;

    // Update experience
    const updateExpRes = await request(server)
      .put(`/workers/profile/me/experiences/${expId}`)
      .set('Authorization', `Bearer ${workerToken}`)
      .send({
        roleTitle: 'Senior Electrical Engineer & Supervisor',
      });
    if (updateExpRes.status !== 200 || updateExpRes.body.roleTitle !== 'Senior Electrical Engineer & Supervisor') {
      throw new Error('Failed to update experience record');
    }

    // Ownership test: Worker 2 cannot modify Worker 1's experience
    const crossExpRes = await request(server)
      .put(`/workers/profile/me/experiences/${expId}`)
      .set('Authorization', `Bearer ${worker2Token}`)
      .send({ roleTitle: 'Hacked Title' });
    if (crossExpRes.status !== 403) {
      throw new Error(`Expected 403 Forbidden for cross-user experience edit, got ${crossExpRes.status}`);
    }

    console.log('✓ Passed: Worker experience created, updated, and cross-user edit blocked.');

    // -----------------------------------------------------------
    // TEST 5: Qualification & Certification Management
    // -----------------------------------------------------------
    console.log('\n[TEST 5] Testing Worker Qualification / Certification...');
    const addQualRes = await request(server)
      .post('/workers/profile/me/qualifications')
      .set('Authorization', `Bearer ${workerToken}`)
      .send({
        title: 'Level 3 National Vocational Certificate in Electrical Installation',
        issuer: 'NAVTTC Pakistan',
        qualificationType: 'VOCATIONAL_CERTIFICATE',
        issuedOn: '2019-06-01',
      });

    if (addQualRes.status !== 201) {
      throw new Error(`Expected 201 Created for qualification, got ${addQualRes.status}`);
    }
    const qualId = addQualRes.body.id;

    const crossQualRes = await request(server)
      .delete(`/workers/profile/me/qualifications/${qualId}`)
      .set('Authorization', `Bearer ${worker2Token}`);
    if (crossQualRes.status !== 403) {
      throw new Error(`Expected 403 Forbidden for cross-user qualification deletion, got ${crossQualRes.status}`);
    }
    console.log('✓ Passed: Qualification added and cross-user deletion strictly prevented.');

    // -----------------------------------------------------------
    // TEST 6: Availability & Weekly Schedule Management
    // -----------------------------------------------------------
    console.log('\n[TEST 6] Testing Worker Availability Management...');
    const availRes = await request(server)
      .put('/workers/profile/me/availability')
      .set('Authorization', `Bearer ${workerToken}`)
      .send({
        availabilityStatus: 'AVAILABLE',
        isAvailable: true,
        weeklySchedule: [
          { dayOfWeek: 1, startTime: '09:00', endTime: '18:00', isAvailable: true, engagementPreference: 'DAILY' },
          { dayOfWeek: 2, startTime: '09:00', endTime: '18:00', isAvailable: true, engagementPreference: 'DAILY' },
          { dayOfWeek: 3, startTime: '09:00', endTime: '18:00', isAvailable: true, engagementPreference: 'DAILY' },
        ],
      });

    if (availRes.status !== 200) {
      throw new Error(`Expected 200 OK for availability, got ${availRes.status}`);
    }
    if (availRes.body.profile.availability.length !== 3) {
      throw new Error('Weekly schedule slots were not saved');
    }
    console.log('✓ Passed: Worker availability and weekly schedule saved.');

    // -----------------------------------------------------------
    // TEST 7: Portfolio Management
    // -----------------------------------------------------------
    console.log('\n[TEST 7] Testing Worker Portfolio Management...');
    const portRes = await request(server)
      .put('/workers/profile/me/portfolio')
      .set('Authorization', `Bearer ${workerToken}`)
      .send({
        portfolioItems: [
          {
            title: 'Commercial Plaza 3-Phase DB Box Wiring',
            description: 'Installed 100A main circuit breaker with surge protection and generator changeover switch.',
            completedDate: '2024-02-10',
          },
        ],
      });

    if (portRes.status !== 200) {
      throw new Error(`Expected 200 OK for portfolio, got ${portRes.status}`);
    }
    if (portRes.body.profile.portfolioItems.length !== 1) {
      throw new Error('Portfolio items not saved');
    }
    console.log('✓ Passed: Worker portfolio items stored and structured.');

    // -----------------------------------------------------------
    // TEST 8: Worker Address & PostGIS Location
    // -----------------------------------------------------------
    console.log('\n[TEST 8] Testing Worker Address & PostGIS Coordinates...');
    const addrRes = await request(server)
      .put('/workers/profile/me/address')
      .set('Authorization', `Bearer ${workerToken}`)
      .send({
        locality: 'I-8/3',
        city: 'Islamabad',
        province: 'Islamabad Capital Territory',
        latitude: 33.6687,
        longitude: 73.0763,
      });

    if (addrRes.status !== 200) {
      throw new Error(`Expected 200 OK for address, got ${addrRes.status}`);
    }
    if (!addrRes.body.address || addrRes.body.address.city !== 'Islamabad') {
      throw new Error('Address city was not saved');
    }
    console.log(`✓ Passed: Worker address and PostGIS Point saved. Completion now: ${addrRes.body.completion.percentage}%`);

    // -----------------------------------------------------------
    // TEST 9: Employer Profile & Preferences Management
    // -----------------------------------------------------------
    console.log('\n[TEST 9] Testing Employer Profile & Preferences Management...');
    const empProfileRes = await request(server)
      .get('/employers/profile/me')
      .set('Authorization', `Bearer ${employerToken}`);

    if (empProfileRes.status !== 200) {
      throw new Error(`Expected 200 OK for employer profile, got ${empProfileRes.status}`);
    }
    if (!empProfileRes.body.profile || !empProfileRes.body.stats) {
      throw new Error('Employer profile missing stats or profile data');
    }

    const updateEmpRes = await request(server)
      .patch('/employers/profile/me')
      .set('Authorization', `Bearer ${employerToken}`)
      .send({
        businessName: 'Kashif Commercial Contracting Ltd',
        description: 'Prime contractor executing commercial and luxury residential projects across Islamabad and Rawalpindi.',
        ntnTaxNumber: '7654321-0',
      });
    if (updateEmpRes.status !== 200) {
      throw new Error(`Expected 200 OK for employer update, got ${updateEmpRes.status}`);
    }

    const prefRes = await request(server)
      .put('/employers/profile/me/preferences')
      .set('Authorization', `Bearer ${employerToken}`)
      .send({
        preferredEngagementTypes: ['DAILY', 'PROJECT'],
        minExperienceMonths: 24,
        preferredLanguages: ['ur-PK', 'en-US'],
      });
    if (prefRes.status !== 200) {
      throw new Error('Failed to update employer preferences');
    }

    const empAddrRes = await request(server)
      .put('/employers/profile/me/address')
      .set('Authorization', `Bearer ${employerToken}`)
      .send({
        locality: 'Blue Area',
        city: 'Islamabad',
        province: 'Islamabad Capital Territory',
        latitude: 33.7153,
        longitude: 73.0645,
      });
    if (empAddrRes.status !== 200) {
      throw new Error('Failed to update employer address');
    }
    console.log(`✓ Passed: Employer profile, preferences, and PostGIS address updated. Completion: ${empAddrRes.body.completion.percentage}%`);

    // -----------------------------------------------------------
    // TEST 10: Role Boundary Enforcement (Cross-Role Editing Prohibited)
    // -----------------------------------------------------------
    console.log('\n[TEST 10] Testing Role Boundaries (Worker vs Employer)...');
    // Worker tries to access employer endpoint
    const workerOnEmp = await request(server)
      .get('/employers/profile/me')
      .set('Authorization', `Bearer ${workerToken}`);
    if (workerOnEmp.status !== 403) {
      throw new Error(`Expected 403 Forbidden for worker on employer route, got ${workerOnEmp.status}`);
    }

    // Employer tries to access worker endpoint
    const empOnWorker = await request(server)
      .get('/workers/profile/me')
      .set('Authorization', `Bearer ${employerToken}`);
    if (empOnWorker.status !== 403) {
      throw new Error(`Expected 403 Forbidden for employer on worker route, got ${empOnWorker.status}`);
    }
    console.log('✓ Passed: Worker and Employer role boundaries strictly enforced by RolesGuard.');

    // -----------------------------------------------------------
    // TEST 11: Public Profile Sanitization
    // -----------------------------------------------------------
    console.log('\n[TEST 11] Testing Public Profile Sanitization...');
    const publicWorkerRes = await request(server).get(`/workers/public/${workerProfileId}`);
    if (publicWorkerRes.status !== 200) {
      throw new Error(`Expected 200 OK for public worker, got ${publicWorkerRes.status}`);
    }
    const publicWorker = publicWorkerRes.body;
    if ((publicWorker as any).email || (publicWorker as any).phone || (publicWorker as any).streetAddress) {
      throw new Error('SECURITY VIOLATION: Private contact info or exact address leaked in public profile!');
    }
    if (!publicWorker.safetyNotice) {
      throw new Error('Safety disclaimer missing from public worker profile');
    }

    const publicEmpRes = await request(server).get(`/employers/public/${employerProfileId}`);
    if (publicEmpRes.status !== 200) {
      throw new Error(`Expected 200 OK for public employer, got ${publicEmpRes.status}`);
    }
    if ((publicEmpRes.body as any).ntnTaxNumber) {
      throw new Error('SECURITY VIOLATION: NTN tax number leaked in public employer profile!');
    }
    console.log('✓ Passed: Public profiles safely redact private contact and tax details while including safety notice.');

    console.log('\n========================================================');
    console.log('✓ ALL 11 PROFILE MANAGEMENT AUTOMATED TESTS PASSED! 🚀');
    console.log('========================================================\n');
  } catch (error) {
    console.error('\n❌ Test suite failed:', error);
    process.exitCode = 1;
  } finally {
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

runProfileAutomatedTests();
