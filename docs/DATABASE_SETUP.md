# LabourLens Database Setup & Administration Guide

## 1. Overview
This guide documents the local setup, configuration, migration management, and spatial querying for **LabourLens** (`labourlens_db`).

- **Database Engine**: PostgreSQL 18.7 (x86_64)
- **Spatial Extension**: PostGIS 3.7.0
- **ORM**: Prisma 6.19.0
- **Backend**: NestJS 12+ (TypeScript)

---

## 2. Environment Configuration

The database connection string is configured in `apps/api/.env` and the root `.env`:

```env
DATABASE_URL="postgresql://postgres:khan1234@localhost:5432/labourlens_db?schema=public"
NODE_ENV="development"
PORT=4000
```

> **Security Note**: Never commit actual database passwords or credentials to version control. The `.env` files are ignored via `.gitignore`.

---

## 3. Database Migration Management

Prisma is used for schema migrations and version control.

### 3.1 Applying Migrations
To apply all pending migrations in development:
```bash
cd apps/api
npm run db:deploy
```
Or with Prisma CLI:
```bash
npx --prefix apps/api prisma migrate deploy --schema apps/api/prisma/schema.prisma
```

### 3.2 Checking Migration Status
```bash
npx --prefix apps/api prisma migrate status --schema apps/api/prisma/schema.prisma
```

### 3.3 Re-generating Prisma Client
```bash
npx --prefix apps/api prisma generate --schema apps/api/prisma/schema.prisma
```

### 3.4 Prisma Studio (Visual Data Browser)
To explore tables visually on `http://localhost:5555`:
```bash
cd apps/api
npm run db:studio
```

---

## 4. PostGIS 3.7.0 Spatial Implementation

Spatial coordinates use **WGS-84 (SRID 4326)** with PostGIS `geography(Point, 4326)`.

### 4.1 Schema Definition (`apps/api/prisma/schema.prisma`)
```prisma
model Address {
  id        String                                 @id @default(uuid()) @db.Uuid
  location  Unsupported("geography(Point, 4326)")?
  ...
  @@index([location], type: Gist)
  @@map("addresses")
}
```

### 4.2 Parameterized Spatial Operations (`SpatialService`)
To protect against SQL injection while utilizing native PostGIS functions, all spatial operations use Prisma tagged template literals (`$queryRaw` and `$executeRaw`):

1. **Setting / Updating Point Geometry**:
   ```typescript
   await prisma.$executeRaw`
     UPDATE "addresses"
     SET "location" = ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography
     WHERE "id" = ${addressId}::uuid;
   `;
   ```
   *Note: In PostGIS, Longitude is always the first argument, followed by Latitude.*

2. **Proximity Search using GiST Index (`ST_DWithin`)**:
   ```typescript
   const nearby = await prisma.$queryRaw`
     SELECT id, locality, city,
            ST_Distance(location, ST_SetSRID(ST_MakePoint(${lon}, ${lat}), 4326)::geography) AS distance_meters
     FROM "addresses"
     WHERE "location" IS NOT NULL
       AND "deleted_at" IS NULL
       AND ST_DWithin(location, ST_SetSRID(ST_MakePoint(${lon}, ${lat}), 4326)::geography, ${radiusMeters})
     ORDER BY distance_meters ASC
     LIMIT ${limit};
   `;
   ```

3. **Geodesic Distance Calculation (`ST_Distance`)**:
   ```typescript
   const result = await prisma.$queryRaw`
     SELECT ST_Distance(
       ST_SetSRID(ST_MakePoint(${lon1}, ${lat1}), 4326)::geography,
       ST_SetSRID(ST_MakePoint(${lon2}, ${lat2}), 4326)::geography
     ) AS distance_meters;
   `;
   ```

---

## 5. Verification & Testing

An automated verification test script verifies NestJS application context bootstrapping, database connectivity, table integrity, and spatial calculations:

```bash
# Compile TypeScript and run verification
cd apps/api
npm run build
npm run test:db
```

Expected output includes:
- NestJS `PrismaService` connection verification.
- PostGIS 3.7.0 version confirmation.
- Verification of 43 public tables across all 21 modules.
- Verification of the `addresses_location_idx` GiST spatial index.
- Relational insert and cascade deletion test.
- PostGIS geodesic distance calculation.
