# LabourLens Backend API

NestJS backend API service for LabourLens.

## Overview
Core REST and WebSocket API service managing authentication, business logic, integrations, and communication between web, mobile, and AI services.

## Tech Stack
- NestJS
- Node.js & TypeScript
- Prisma ORM
- Local PostgreSQL (`labourlens_db`) with PostGIS for development; Neon PostgreSQL is the planned production target

## Database setup

1. Create the `labourlens_db` database in your local PostgreSQL installation and ensure PostGIS is installed.
2. Copy `.env.example` to `.env` in this directory and replace the placeholder username/password in `DATABASE_URL`.
3. Install dependencies with `npm install`.
4. Apply the initial migration with `npx prisma migrate dev` and generate the client with `npx prisma generate`.
5. Verify PostGIS with `psql $env:DATABASE_URL -c "SELECT PostGIS_Full_Version();"` in PowerShell (or pass the connection URL using your shell's quoting syntax).

Never put a real connection string in source control. `.env` is ignored by Git. Use the same Prisma migration history and a deployment-specific `DATABASE_URL` when moving to Neon.

