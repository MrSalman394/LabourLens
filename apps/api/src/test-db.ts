import 'reflect-metadata';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PrismaService } from './prisma/prisma.service';
import { SpatialService } from './spatial/spatial.service';

async function runDatabaseConnectivityTest() {
  console.log('====================================================');
  console.log('LabourLens Phase 3: NestJS Database Verification');
  console.log('====================================================');

  console.log('1. Bootstrapping NestJS application context...');
  const app = await NestFactory.createApplicationContext(AppModule, { logger: ['log', 'error', 'warn'] });
  const prisma = app.get(PrismaService);
  const spatial = app.get(SpatialService);
  console.log('✓ NestJS Application context initialized successfully.');

  try {
    console.log('\n2. Testing Database Connectivity & PostGIS...');
    const health = await prisma.checkHealth();
    console.log(`✓ PostgreSQL Status: ${health.status}`);
    console.log(`✓ PostGIS Version: ${health.postgisVersion}`);
    console.log(`✓ Server Timestamp: ${health.timestamp.toISOString()}`);

    console.log('\n3. Verifying Schema Tables in labourlens_db...');
    const tables = await prisma.$queryRaw<Array<{ table_name: string }>>`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
      ORDER BY table_name ASC;
    `;
    console.log(`✓ Total Public Tables Discovered: ${tables.length}`);
    const tableNames = tables.map(t => t.table_name);
    console.log('Tables:', tableNames.join(', '));

    // Verify key tables
    const requiredTables = [
      'users',
      'user_identities',
      'roles',
      'permissions',
      'employer_profiles',
      'worker_profiles',
      'categories',
      'skills',
      'worker_skills',
      'worker_experiences',
      'worker_availability',
      'addresses',
      'job_postings',
      'job_requirements',
      'job_applications',
      'hires',
      'match_runs',
      'match_results',
      'match_factors',
      'verification_records',
      'reviews',
      'conversations',
      'messages',
      'notifications',
      'complaints',
      'audit_logs',
      'payment_records',
    ];

    const missing = requiredTables.filter(t => !tableNames.includes(t));
    if (missing.length > 0) {
      throw new Error(`Missing expected tables: ${missing.join(', ')}`);
    }
    console.log('✓ All 27+ core module tables confirmed present.');

    console.log('\n4. Verifying PostGIS GiST Spatial Index...');
    const indexes = await prisma.$queryRaw<Array<{ indexname: string; indexdef: string }>>`
      SELECT indexname, indexdef 
      FROM pg_indexes 
      WHERE tablename = 'addresses' AND indexname = 'addresses_location_idx';
    `;
    if (indexes.length === 0) {
      throw new Error('addresses_location_idx GiST index not found on addresses table!');
    }
    console.log(`✓ Spatial Index confirmed: ${indexes[0].indexname} (${indexes[0].indexdef})`);

    console.log('\n5. Executing End-to-End Relational & Spatial Test (Islamabad Coordinates)...');
    // Test transaction creating a User, Address, and running PostGIS ST_DWithin
    const testUser = await prisma.user.create({
      data: {
        status: 'ACTIVE',
        preferredLocale: 'ur-PK',
        identities: {
          create: {
            identityType: 'PHONE',
            normalizedValue: '+923001234567',
            isPrimary: true,
          },
        },
      },
    });
    console.log(`✓ Test User created with ID: ${testUser.id}`);

    // Create address for User in F-10 Islamabad: Longitude 73.0186, Latitude 33.6938
    const testAddress = await prisma.address.create({
      data: {
        ownerUserId: testUser.id,
        addressType: 'HOME',
        locality: 'F-10/3',
        city: 'Islamabad',
        province: 'Islamabad Capital Territory',
        countryCode: 'PK',
        approximateLatitude: 33.6938,
        approximateLongitude: 73.0186,
      },
    });
    console.log(`✓ Test Address created with ID: ${testAddress.id}`);

    // Update spatial geography column using SpatialService (parameterized query)
    await spatial.updateAddressLocation(testAddress.id, 73.0186, 33.6938);
    console.log('✓ Updated Address PostGIS geography Point (SRID 4326) via parameterized SQL.');

    // Query addresses within 5,000 meters of F-10 Markaz (73.0186, 33.6938)
    const nearby = await spatial.findNearbyAddresses(73.0186, 33.6938, 5000);
    console.log(`✓ Spatial ST_DWithin search within 5km returned ${nearby.length} result(s).`);
    console.log(`  Distance to origin: ${Math.round(nearby[0]?.distance_meters ?? 0)} meters.`);

    // Distance calculation between F-10 and Blue Area (73.0551, 33.7100)
    const blueAreaDistance = await spatial.calculateDistanceBetweenCoordinates(
      73.0186,
      33.6938,
      73.0551,
      33.7100,
    );
    console.log(`✓ PostGIS geodesic distance F-10 to Blue Area: ${Math.round(blueAreaDistance)} meters.`);

    // Clean up test data
    await prisma.user.delete({ where: { id: testUser.id } });
    console.log('✓ Cleaned up test records (Cascade deleted user identities and address).');

    console.log('\n====================================================');
    console.log('✓ ALL DATABASE & NESTJS CONNECTIVITY TESTS PASSED! 🚀');
    console.log('====================================================');
  } catch (err) {
    console.error('❌ Test failed with error:', err);
    process.exit(1);
  } finally {
    await app.close();
  }
}

runDatabaseConnectivityTest();
