# LabourLens — Development & Engineering Log

## Project Baseline: 2026-11-16
**Objective**: Build LabourLens — An Explainable AI-Based Platform for Trustworthy Matching of Domestic and Skilled Workers in Pakistan.  
**Lead Architect & Engineer**: Antigravity Full-Stack Agent  

---

### Entry 001: Repository Inspection & Architectural Alignment
- **Date**: 2026-11-16
- **Status**: Completed
- **Findings**:
  - The repository root contained monorepo skeleton folders (`apps/web`, `apps/api`, `apps/mobile`, `services/ai`, `database`, `docs`, `infrastructure`, `scripts`).
  - Existing `docs` files contained legacy templates relating to an industrial CCTV/PPE safety compliance concept.
  - Environment inspection:
    - Node.js: `v24.14.0`
    - npm: `11.9.0`
    - Git: `2.54.0.windows.1`
    - Python: Windows app alias active, Python path to be finalized in Phase 4.
  - Project scope realigned to the canonical FYP mandate: **Explainable AI Matching for Domestic (cook, cleaner, driver, caretaker) & Skilled Workers (electrician, plumber, technician, mechanic) across Pakistan**.
  - Generated Master Project Documentation:
    - `docs/PROJECT_PLAN.md`: Complete 7-Phase implementation roadmap.
    - `docs/ARCHITECTURE.md`: Monorepo architecture, Neon PostgreSQL + PostGIS, Python FastAPI matching service, OpenStreetMap, Trust & Safety design.
    - `docs/DATABASE_DESIGN.md`: Detailed schema design with PostGIS spatial indexing.
    - `docs/API_CONTRACTS.md`: Unified REST API contracts for Web and Mobile.

---

### Entry 002: Phase 1 — Web Application Setup & Design System
- **Date**: 2026-11-16
- **Status**: In Progress
- **Scope**:
  - Set up Next.js 14+ App Router in `apps/web` with TypeScript and Tailwind CSS.
  - Design system with Pakistan-focused color palette (Emerald green, Slate neutrals, Warm Amber accents).
  - Prominent safety disclaimer ("Verification does not guarantee safety").
  - Accessible, responsive layout with bilingual UI readiness.
  - Public landing page with domestic & skilled categories, XAI match preview, OpenStreetMap location features, and city hubs.
  - Scaffolds for Auth (`/auth/login`, `/auth/register`) and Role-Based Dashboards (`/dashboard/employer`, `/dashboard/worker`, `/dashboard/admin`) with transparent prototype/mock labels.
  - Ensure zero build/lint errors.

## 2026-11-16 — Phase 2: Database Design Review (Completed)
- Inspected the current connection implementation: Prisma datasource uses PostgreSQL and reads DATABASE_URL from the environment; apps/api/.env.example targets localhost:5432/labourlens_db with placeholders.
- Existing schema/migration covered only users and a basic worker profile plus a PostGIS geography column/index.
- Prepared comprehensive design proposals in `DATABASE_DESIGN.md`, `ENTITY_RELATIONSHIPS.md`, `DATABASE_DICTIONARY.md`, and `DATABASE_DECISIONS.md` covering all 21 core modules.

---

### Entry 003: Phase 3 — Database Implementation (Completed)
- **Date**: 2026-11-16
- **Status**: Completed & Verified
- **Accomplishments**:
  1. **Schema Implementation**:
     - Implemented all 40+ models across 21 core modules in `apps/api/prisma/schema.prisma` matching the approved 3NF architecture.
     - Configured enums, primary keys (UUIDv4), foreign keys with strict cascade policies, unique constraints, and indexes.
     - Configured `Unsupported("geography(Point, 4326)")` for PostGIS spatial field with native `@@index([location], type: Gist)`.
  2. **Migration & Version Control**:
     - Generated and applied clean initial migration `20261116125120_init_full_schema` to local PostgreSQL 18.7 (`labourlens_db`).
     - Added PostGIS GiST index migration `20261116125351_add_gist_index`.
     - Generated Prisma Client (`v6.19.0`).
  3. **NestJS Integration & Parameterized SQL**:
     - Installed NestJS 12 (`@nestjs/common`, `@nestjs/core`, `@nestjs/platform-express`) and TypeScript in `apps/api`.
     - Created `PrismaService` and `PrismaModule` with connection lifecycle management and health checking.
     - Implemented `SpatialService` providing parameterized PostGIS queries (`$executeRaw` and `$queryRaw`) for `ST_SetSRID`, `ST_MakePoint`, `ST_DWithin`, and `ST_Distance`.
  4. **Verification Testing (`apps/api/src/test-db.ts`)**:
     - Bootstrapped NestJS application context.
     - Verified connection to `labourlens_db` with PostGIS 3.7.0.
     - Confirmed all 43 public tables and spatial indexes.
     - Executed end-to-end relational insert, PostGIS spatial update, 5km radius search, geodesic distance calculation, and cascade cleanup. All tests passed.
  5. **Documentation**:
     - Created `docs/DATABASE_SETUP.md` covering local setup, migration workflows, spatial querying, and testing.

---

### Entry 004: Phase 4 — Backend Authentication and Authorization (Completed)
- **Date**: 2026-11-16
- **Status**: Completed & Verified
- **Accomplishments**:
  1. **Authentication Architecture**:
     - Dual-token lifecycle: Short-lived access JWT (15-minute expiration) and single-use SHA-256 hashed refresh tokens stored in `auth_sessions`.
     - Bcrypt password hashing with 12 rounds.
     - Single-use Refresh Token Rotation with automatic token reuse detection (revokes all active sessions upon breach detection).
     - Multi-step registration for Employers and Workers creating User, UserIdentity, UserRoleAssignment, and Profile in atomic Prisma transactions.
     - Forgot password and password reset workflows with cryptographically secure, single-use, 15-minute expiration reset tokens.
     - Signed email verification workflow.
     - Account status validation denying suspended, deactivated, or banned accounts.
  2. **Role-Based Access Control (RBAC) & Security**:
     - Implemented `JwtAuthGuard`, `RolesGuard`, `OwnershipGuard` with metadata decorators `@Roles()`, `@CurrentUser()`, `@Public()`.
     - Integrated `@nestjs/throttler` rate limiting (100 req/min global, 5 req/min on login and sensitive endpoints).
     - Integrated `helmet` security headers and restricted origin CORS.
     - Enforced `class-validator` and `class-transformer` with strict payload whitelisting and rejection of non-whitelisted properties.
     - Zero sensitive data exposure: Password hashes, salt, and token hashes are systematically stripped from all API outputs.
  3. **REST Endpoints Implemented**:
     - `POST /auth/register/employer`: Employer registration with optional company metadata.
     - `POST /auth/register/worker`: Worker registration with trade experience and rate metadata.
     - `POST /auth/login`: Email and password login with generic error messages.
     - `POST /auth/refresh`: Refresh token rotation with reuse detection.
     - `POST /auth/logout`: Single-session revocation.
     - `POST /auth/forgot-password`: Anti-enumeration password reset dispatch.
     - `POST /auth/reset-password`: Single-use token reset with session revocation.
     - `POST /auth/verify-email`: Signed token email verification.
     - `GET /auth/me`: Sanitized authenticated user profile.
     - RBAC test endpoints: `/auth/employer/only`, `/auth/worker/only`, `/auth/admin/only`.
  4. **Automated Test Suite (`apps/api/src/test-auth.ts`)**:
     - Developed and ran 15 comprehensive automated test scenarios using Supertest against an in-memory NestJS HTTP server and local PostgreSQL database.
     - Scenario 1: Successful Employer registration (201 Created).
     - Scenario 2: Successful Worker registration (201 Created).
     - Scenario 3: Duplicate email rejection (409 Conflict).
     - Scenario 4: Successful login (200 OK with access & refresh tokens).
     - Scenario 5: Incorrect password rejection with generic error message (401 Unauthorized).
     - Scenario 6: Expired access token rejection (401 Unauthorized).
     - Scenario 7: Refresh token rotation and revoked token reuse detection & blocking (401 Unauthorized).
     - Scenario 8: Logout and session revocation (200 OK; revoked token blocked from refresh).
     - Scenario 9: Unauthenticated & invalid signature rejection (401 Unauthorized).
     - Scenario 10: RBAC guards enforcing role boundaries (Worker 403 on employer route, Worker 200 on worker route, Employer 403 on admin route).
     - Scenario 11: Input validation & password strength rejection (400 Bad Request on weak password, invalid email, unwhitelisted fields).
     - Scenario 12: GET /auth/me verified sanitized profile with zero credential leakage.
     - Scenario 13: Password reset end-to-end verified with new password login and old password revocation.
     - Scenario 14: Consumed password reset token reuse rejection (400 Bad Request).
     - Scenario 15: Email verification workflow verified in database.
     - All 15 automated test scenarios passed with 0 failures. Test records cleaned up.
  5. **Documentation**:
     - Updated `docs/API_CONTRACTS.md` with complete payload, header, validation, and response contracts for all 9 authentication endpoints.
     - Updated `docs/ARCHITECTURE.md` with detailed Authentication, Authorization, RBAC, and Security Architecture.

---

### Entry 005: Phase 5 — Worker and Employer Profile Management (Completed)
- **Date**: 2026-11-19
- **Status**: Completed & Verified
- **Accomplishments**:
  1. **Database Schema Enhancements**:
     - Added `AvailabilityStatus` enum (`AVAILABLE`, `BUSY`, `UNAVAILABLE`).
     - Enhanced `WorkerProfile` with `headline`, `profilePictureUrl`, `availabilityStatus`, `languages` (text array), `portfolioItems` (JSONB).
     - Enhanced `EmployerProfile` with `businessName`, `profilePictureUrl`, `hiringPreferences` (JSONB).
     - Enhanced `WorkerQualification` with `qualificationType`, `credentialUrl`.
     - Generated and applied migration `20261116135238_add_profile_management_fields` cleanly to `labourlens_db`.
     - Seeded taxonomy catalog with 12 occupational categories and 47 realistic Pakistani trade skills across `DOMESTIC`, `SKILLED_TRADE`, and `INDUSTRIAL`.
  2. **Backend Profile Module (`apps/api/src/profile`)**:
     - **Profile Completion Engine (`ProfileCompletionService`)**: Implemented dynamic score calculation and action-oriented improvement suggestions for workers and employers. Maintained strict architectural separation between profile completeness and security verification tiers.
     - **Worker Profile Service & Controller**:
       - `GET /workers/profile/me`: Full profile, relations, address, BigInt wage serialization, completion result.
       - `PATCH /workers/profile/me`: Personal details, wage preferences, bio, languages, status.
       - `PUT /workers/profile/me/skills`: Atomic transaction updating skill inventory with proficiency levels and experience.
       - `POST /workers/profile/me/experiences`, `PUT .../:id`, `DELETE .../:id`: Work experience CRUD with strict ownership validation.
       - `POST /workers/profile/me/qualifications`, `PUT .../:id`, `DELETE .../:id`: Qualification and certification management with ownership validation.
       - `PUT /workers/profile/me/availability`: Weekly scheduling slots and status management.
       - `PUT /workers/profile/me/portfolio`: Portfolio project showcase management.
       - `PUT /workers/profile/me/address`: Geographic coordinates and PostGIS `geography(Point, 4326)` updates via parameterized SQL.
       - `GET /workers/public/:id`: Public sanitized profile redacting private contact details and exact addresses.
     - **Employer Profile Service & Controller**:
       - `GET /employers/profile/me`: Business details, hiring statistics (total jobs, active openings, hires), address, completion score.
       - `PATCH /employers/profile/me`: Business metadata, employer type, NTN tax number.
       - `PUT /employers/profile/me/preferences`: Hiring preferences (preferred categories, engagement types, budget).
       - `PUT /employers/profile/me/address`: Business location and PostGIS coordinates.
       - `GET /employers/public/:id`: Public employer profile with active job openings.
     - **Taxonomy Controller & Service**:
       - `GET /taxonomy/categories`: All categories with skill counts.
       - `GET /taxonomy/skills`: All skills with category filtering.
  3. **Frontend Dashboard Implementation (`apps/web`)**:
     - Created `ApiClient` library handling API communication, token storage, and authentication state.
     - Implemented `ProfileCompletionCard` with color-coded progress bars, breakdown indicators, suggested improvements, and safety disclaimers.
     - Implemented `WorkerProfileView` with tabbed editing for Overview, Personal Info & Bio, Skills Management, Work Experience, Availability, PostGIS Location (with Pakistan city presets), and Portfolio/Certifications.
     - Implemented `EmployerProfileView` with Overview, Business Details, Hiring Preferences, and PostGIS Location settings.
     - Integrated `apps/web/src/app/dashboard/[role]/page.tsx` with dynamic role detection, authentication gating, and instant demo account launching.
     - Converted `sign-in` and `register` pages to functional Next.js forms integrated with backend authentication endpoints.
  4. **Automated Integration Tests (`apps/api/src/test-profile.ts`)**:
     - Scenario 1: Fetch Worker Profile & Completion Score (200 OK).
     - Scenario 2: Update Worker Personal & Professional Info (200 OK).
     - Scenario 3: Update Worker Skills from real taxonomy (200 OK).
     - Scenario 4: Worker Experience CRUD & cross-user modification blocking (403 Forbidden).
     - Scenario 5: Worker Qualification CRUD & cross-user deletion blocking (403 Forbidden).
     - Scenario 6: Worker Availability and weekly schedule update (200 OK).
     - Scenario 7: Worker Portfolio items storage (200 OK).
     - Scenario 8: Worker Address and PostGIS Point update (200 OK).
     - Scenario 9: Employer Profile & Preferences management (200 OK).
     - Scenario 10: Role boundary enforcement: Worker blocked from employer routes; Employer blocked from worker routes (403 Forbidden).
     - Scenario 11: Public profile sanitization (200 OK; private contact and tax details verified redacted).
     - All 11 tests passed with 0 failures.
  5. **Documentation Deliverables**:
     - Updated `docs/API_CONTRACTS.md` with complete schemas and DTOs for all profile endpoints.
     - Updated `docs/DATABASE_DESIGN.md` reflecting Module 3, 4, and 6 schema updates.


---

### Entry 006: Production Role-Based Authentication & Session Architecture
- **Date**: 2026-11-19
- **Status**: Completed & Verified
- **Scope**:
  - Full-stack production role-based authentication system across NestJS (`apps/api`) and Next.js App Router (`apps/web`).
  - Implemented Argon2id password hashing with backwards-compatible migration fallback.
  - Zero token storage in browser `localStorage`; 100% httpOnly secure cookie session management.
  - Refresh token rotation using SHA-256 hashed sessions in `auth_sessions` table with lineage revocation on reuse.
  - Role-Based Access Control (RBAC) supporting `WORKER`, `EMPLOYER`, and `ADMIN` roles.
  - Next.js Edge Middleware route guards protecting `/employer/*`, `/worker/*`, `/admin/*` with automatic redirection based on authenticated server roles.
  - Next.js Route Handlers proxying auth requests (`/api/auth/login`, `/api/auth/register/worker`, `/api/auth/register/employer`, `/api/auth/logout`, `/api/auth/me`, `/api/auth/forgot-password`, `/api/auth/reset-password`).
  - Secure Administrator CLI seeding script (`npm run seed:admin`) with strict prohibition of public admin registration.
  - Password recovery workflow via single-use 15-minute expiring cryptographic tokens with anti-enumeration responses.
  - Dedicated front-end authentication pages: `/login`, `/register` (dual-role toggle), `/forgot-password`, `/reset-password`, `/admin/dashboard`, `/worker/dashboard`, `/employer/dashboard`.
  - Comprehensive automated testing: 15/15 auth tests passed, 11/11 profile tests passed, PostGIS spatial tests passed, Next.js build clean with 0 TypeScript errors.
