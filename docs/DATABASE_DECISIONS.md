# LabourLens Database Architecture Decision Records (ADRs)

**Status**: Proposed Architecture for Review  
**Target Environment**: PostgreSQL 18.7, PostGIS 3.7.0 (`labourlens_db`), Prisma ORM 6.x  
**Scope**: Pakistan-wide Employment Platform for Domestic & Skilled Labor

---

## ADR-001: Database Target & Extension Verification
- **Decision**: Target the active local PostgreSQL 18.7 instance on port `5432` with database `labourlens_db` and PostGIS 3.7.0.
- **Context & Verification**: The local instance is verified online with PostGIS 3.7.0 pre-installed in `labourlens_db`.
- **Consequences**: Local development utilizes full native spatial extensions. The schema and migrations remain 100% compatible with production cloud PostgreSQL services (such as Neon or AWS RDS) supporting PostGIS.

---

## ADR-002: Phone-First Authentication via Normalized `user_identities`
- **Decision**: Decouple the `users` table from authentication credentials by creating a normalized `user_identities` table supporting both `PHONE` (+92 numbers) and `EMAIL`.
- **Rationale**: In Pakistan, the overwhelming majority of domestic workers (maids, cooks, drivers) and daily-wage tradespeople (masons, plumbers) communicate exclusively via mobile phone and SMS/WhatsApp, whereas corporate and individual employers frequently use email. A single `email VARCHAR UNIQUE` constraint in `users` would exclude un-banked or non-email-using workers.
- **Consequences**: Supports passwordless OTP authentication for workers while allowing password or magic-link sign-in for employers on the same platform.

---

## ADR-003: Pure Decoupling of AI Predictions from Worker Profiles
- **Decision**: **Never store AI suitability scores, match percentages, or rank labels as permanent columns on `worker_profiles`.** All AI matching outputs reside exclusively in ephemeral `match_runs`, `match_results`, and `match_factors`.
- **Rationale**:
  1. Worker profiles contain objective, verifiable biographical facts (experience, skills, certifications, location).
  2. Compatibility is inherently relational and contextual: a worker's match score depends entirely on a specific job's requirements, distance, wage budget, and timing.
  3. Storing AI predictions on worker profiles would create algorithmic prejudice, stale data, and ethical/regulatory liabilities.
- **Consequences**: Matching runs expire gracefully (`expires_at`), workers are evaluated afresh against each new requisition, and Explainable AI (XAI) factors can be inspected historically without mutating worker entities.

---

## ADR-004: PostGIS Spherical Geodesy (`geography(Point, 4326)`) & Privacy
- **Decision**: Use PostgreSQL PostGIS `geography(Point, 4326)` for all spatial coordinates, paired with a strict privacy shield.
- **Rationale**:
  - Pakistan spans over 1,500 km north-to-south. Planar `geometry` projections introduce significant distortion unless using complex local zone UTM projections. `geography` calculates true Great Circle distances in meters natively.
  - Workers' home residences and domestic employers' households must not be exposed as raw high-precision GPS pins on public maps to prevent harassment, theft, and stalking.
- **Consequences**:
  - Distance queries use `ST_DWithin(a.location, $job_location, $radius_meters)` with GiST spatial indexing.
  - Public search responses only return rounded approximate centroids, neighborhood sectors (e.g., F-10, Gulberg, Clifton), or cities.

---

## ADR-005: Dual-Language Taxonomy (English & Urdu)
- **Decision**: Store canonical occupational categories and skills with both English (`name_en`) and Urdu (`name_ur`) strings in database lookup tables (`categories`, `skills`).
- **Rationale**: Search, matching, and UI accessibility in Pakistan require bilingual comprehension. An employer searching for *"Plumber"* and a worker registered as *"پلمبر"* must resolve to the identical taxonomy node.
- **Consequences**: Avoids hardcoding translation mappings in frontend clients; enables semantic matching algorithms to ingest bilingual synonym embeddings directly from the database.

---

## ADR-006: 64-Bit Integer Minor Units for Monetary Values (PKR)
- **Decision**: Store all wages, budgets, and payments as `BIGINT` in minor units (e.g. Paisas / 1 PKR = 100 units).
- **Rationale**: IEEE 754 floating-point numbers introduce cumulative rounding errors in financial transactions and payroll reconciliations.
- **Consequences**: Zero rounding discrepancies across hourly rates, daily wages (*dihari*), and milestone payouts.

---

## ADR-007: Append-Only Event Ledgers for State Machines & Governance
- **Decision**: Pair mutable status columns on primary records (`job_applications`, `payment_records`, `complaints`) with immutable, append-only event tables (`application_events`, `payment_transactions`, `moderation_actions`, `audit_logs`).
- **Rationale**: In dispute scenarios (e.g. unpaid wages, harassment allegations, or wrongful rejection), having only the current status is legally insufficient. The platform must provide an immutable timeline of who changed what, when, and why.
- **Consequences**: Provides tamper-evident audit trails for regulatory compliance, internal platform moderation, and dispute arbitration.

---

## ADR-008: Controlled Soft-Deletion Policy
- **Decision**: Implement nullable `deleted_at TIMESTAMPTZ` on recoverable business entities (`users`, `worker_profiles`, `employer_profiles`, `job_postings`, `addresses`).
- **Rationale**: Hard deleting an employer or worker would break relational integrity for historical financial payouts, completed job reviews, and legal complaint files.
- **Consequences**: Partial indexes (`WHERE deleted_at IS NULL`) ensure query performance remains optimal for active marketplace listings.

---

## ADR-009: Evidence-Based Verification without Absolute Safety Guarantees
- **Decision**: Structure `verification_records` to store verifiable document hashes, issuance dates, and verification types (`CNIC_NADRA`, `POLICE_VERIFICATION`, `VOCATIONAL_CERTIFICATE`), explicitly distinguishing document verification from background character guarantees.
- **Rationale**: Avoid legal liability for the platform while providing transparent trust indicators for employers.

---

## ADR-010: Review Grounding in Confirmed Hires
- **Decision**: Reviews require a foreign key to a completed `hires` record (`UNIQUE(hire_id, author_user_id, subject_user_id)`).
- **Rationale**: Completely eliminates fake review bombing, competitor sabotage, and ungrounded reputation inflation by requiring proof of a legitimate paid engagement before allowing feedback.
