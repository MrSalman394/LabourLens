# LabourLens Database Dictionary & Schema Specification

**Status**: Proposed Architecture for Review  
**Database Target**: PostgreSQL 18.7 + PostGIS 3.7.0 (`labourlens_db`)

---

## Module 1: Users & Authentication

### 1.1 `users`
Represents the core account entity across all user personas.
| Column | Type | Nullable | Default | Constraints / Description |
|---|---|:---:|---|---|
| `id` | UUID | No | `gen_random_uuid()` | Primary Key |
| `status` | VARCHAR(32) | No | `'ACTIVE'` | Enum: `PENDING_VERIFICATION`, `ACTIVE`, `SUSPENDED`, `BANNED`, `DEACTIVATED` |
| `preferred_locale` | VARCHAR(10) | No | `'ur-PK'` | Primary UI language (e.g. `ur-PK`, `en-US`) |
| `created_at` | TIMESTAMPTZ | No | `NOW()` | Account creation timestamp |
| `updated_at` | TIMESTAMPTZ | No | `NOW()` | Auto-updated modification timestamp |
| `deleted_at` | TIMESTAMPTZ | Yes | NULL | Soft-deletion timestamp |

### 1.2 `user_identities`
Normalized multi-credential login identities (phone numbers for domestic workers, email for employers).
| Column | Type | Nullable | Default | Constraints / Description |
|---|---|:---:|---|---|
| `id` | UUID | No | `gen_random_uuid()` | Primary Key |
| `user_id` | UUID | No | - | Foreign Key -> `users(id)` ON DELETE CASCADE |
| `identity_type` | VARCHAR(20) | No | - | Enum: `PHONE`, `EMAIL` |
| `normalized_value` | VARCHAR(320) | No | - | Unique phone (e.g. `+923001234567`) or email |
| `is_primary` | BOOLEAN | No | `TRUE` | Whether this is the main communication channel |
| `verified_at` | TIMESTAMPTZ | Yes | NULL | Timestamp of OTP or email verification |
| `created_at` | TIMESTAMPTZ | No | `NOW()` | Record creation timestamp |

### 1.3 `auth_sessions`
Active login sessions storing cryptographic digest tokens.
| Column | Type | Nullable | Default | Constraints / Description |
|---|---|:---:|---|---|
| `id` | UUID | No | `gen_random_uuid()` | Primary Key |
| `user_id` | UUID | No | - | Foreign Key -> `users(id)` ON DELETE CASCADE |
| `token_hash` | BYTEA | No | - | SHA-256 hash of refresh token (UNIQUE) |
| `user_agent` | TEXT | Yes | NULL | Device browser / client string |
| `ip_address_hash`| VARCHAR(64) | Yes | NULL | Anonymized client IP hash |
| `expires_at` | TIMESTAMPTZ | No | - | Session expiration date |
| `revoked_at` | TIMESTAMPTZ | Yes | NULL | Timestamp if session was terminated |
| `created_at` | TIMESTAMPTZ | No | `NOW()` | Session issuance timestamp |

### 1.4 `password_reset_tokens`
Time-limited one-time password reset digests.
| Column | Type | Nullable | Default | Constraints / Description |
|---|---|:---:|---|---|
| `id` | UUID | No | `gen_random_uuid()` | Primary Key |
| `user_id` | UUID | No | - | Foreign Key -> `users(id)` ON DELETE CASCADE |
| `token_hash` | BYTEA | No | - | SHA-256 hash of reset code (UNIQUE) |
| `expires_at` | TIMESTAMPTZ | No | - | Token validity cutoff (typically 15 mins) |
| `consumed_at` | TIMESTAMPTZ | Yes | NULL | When token was used |
| `created_at` | TIMESTAMPTZ | No | `NOW()` | Record issuance timestamp |

---

## Module 2: Roles & Permissions

### 2.1 `roles`
| Column | Type | Nullable | Default | Constraints / Description |
|---|---|:---:|---|---|
| `id` | UUID | No | `gen_random_uuid()` | Primary Key |
| `code` | VARCHAR(50) | No | - | UNIQUE role code (`ADMIN`, `MODERATOR`, `EMPLOYER`, `WORKER`) |
| `name` | VARCHAR(100) | No | - | Display name |
| `description` | TEXT | Yes | NULL | Scope summary |

### 2.2 `permissions`
| Column | Type | Nullable | Default | Constraints / Description |
|---|---|:---:|---|---|
| `id` | UUID | No | `gen_random_uuid()` | Primary Key |
| `code` | VARCHAR(100) | No | - | UNIQUE permission code (`jobs:publish`, `workers:verify`) |
| `description` | TEXT | Yes | NULL | Permission detail |

### 2.3 `user_role_assignments` & `role_permissions`
Junction tables with composite primary keys `(user_id, role_id)` and `(role_id, permission_id)`.

---

## Module 3 & 4: Employer & Worker Profiles

### 3.1 `employer_profiles`
| Column | Type | Nullable | Default | Constraints / Description |
|---|---|:---:|---|---|
| `id` | UUID | No | `gen_random_uuid()` | Primary Key |
| `user_id` | UUID | No | - | Foreign Key -> `users(id)` ON DELETE CASCADE (UNIQUE) |
| `display_name` | VARCHAR(160) | No | - | Individual or Business name |
| `employer_type`| VARCHAR(32) | No | `'INDIVIDUAL_HOUSEHOLD'` | Enum: `INDIVIDUAL_HOUSEHOLD`, `CONTRACTOR`, `ENTERPRISE`, `AGENCY` |
| `ntn_tax_number`| VARCHAR(50) | Yes | NULL | National Tax Number if registered business |
| `description` | TEXT | Yes | NULL | About employer/organization |
| `is_verified` | BOOLEAN | No | `FALSE` | Identity verification state |
| `created_at` | TIMESTAMPTZ | No | `NOW()` | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | No | `NOW()` | Update timestamp |
| `deleted_at` | TIMESTAMPTZ | Yes | NULL | Soft-deletion timestamp |

### 4.1 `worker_profiles`
| Column | Type | Nullable | Default | Constraints / Description |
|---|---|:---:|---|---|
| `id` | UUID | No | `gen_random_uuid()` | Primary Key |
| `user_id` | UUID | No | - | Foreign Key -> `users(id)` ON DELETE CASCADE (UNIQUE) |
| `display_name` | VARCHAR(160) | No | - | Worker professional name |
| `gender` | VARCHAR(16) | Yes | NULL | Gender identity (relevant for domestic household preferences) |
| `primary_category_id` | UUID | Yes | NULL | Foreign Key -> `categories(id)` |
| `bio` | TEXT | Yes | NULL | Self-summary or voice-to-text transcript |
| `experience_months` | INT | No | 0 | Total work experience (`CHECK >= 0`) |
| `expected_wage_hourly_minor` | BIGINT | Yes | NULL | Expected hourly rate in PKR minor units |
| `expected_wage_daily_minor` | BIGINT | Yes | NULL | Expected daily wage (*dihari*) in PKR minor units |
| `preferred_engagement_type` | VARCHAR(20) | No | `'ANY'` | `HOURLY`, `DAILY`, `PROJECT`, `ANY` |
| `verification_level` | VARCHAR(32) | No | `'UNVERIFIED'` | `UNVERIFIED`, `CNIC_VERIFIED`, `POLICE_VERIFIED`, `SKILL_TESTED` |
| `profile_visibility` | VARCHAR(32) | No | `'PUBLIC'` | `PUBLIC`, `REGISTERED_ONLY`, `PRIVATE` |
| `is_available` | BOOLEAN | No | `TRUE` | Quick on/off availability toggle |
| `created_at` | TIMESTAMPTZ | No | `NOW()` | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | No | `NOW()` | Update timestamp |
| `deleted_at` | TIMESTAMPTZ | Yes | NULL | Soft-deletion timestamp |

---

## Module 5, 6 & 7: Skills, Experience, Qualifications & Availability

### 5.1 `categories` & `skills`
- **`categories`**: `id UUID PK`, `parent_id FK NULL`, `code VARCHAR(50) UNIQUE`, `name_en`, `name_ur`, `category_type` (`DOMESTIC`, `SKILLED_TRADE`, `INDUSTRIAL`), `is_active`.
- **`skills`**: `id UUID PK`, `category_id FK`, `code VARCHAR(50) UNIQUE`, `name_en`, `name_ur`, `is_active`.

### 5.2 `worker_skills`
| Column | Type | Nullable | Default | Constraints / Description |
|---|---|:---:|---|---|
| `worker_profile_id` | UUID | No | - | Composite PK (1/2), FK -> `worker_profiles(id)` |
| `skill_id` | UUID | No | - | Composite PK (2/2), FK -> `skills(id)` |
| `proficiency_level`| SMALLINT | No | 3 | Rating 1 to 5 (`CHECK (proficiency_level BETWEEN 1 AND 5)`) |
| `experience_months`| INT | No | 12 | Experience in this specific skill |
| `evidence_source` | VARCHAR(32) | No | `'SELF_DECLARED'` | `SELF_DECLARED`, `TESTED`, `EMPLOYER_VERIFIED` |

### 6.1 `worker_experiences` & `worker_qualifications`
- **`worker_experiences`**: `id UUID PK`, `worker_profile_id FK`, `role_title`, `employer_name`, `city`, `started_on DATE`, `ended_on DATE NULL`, `is_current BOOLEAN`, `description TEXT`, `CHECK (ended_on IS NULL OR ended_on >= started_on)`.
- **`worker_qualifications`**: `id UUID PK`, `worker_profile_id FK`, `title`, `issuer` (e.g. TEVTA, NAVTTC), `issued_on DATE`, `expires_on DATE NULL`, `verification_record_id FK NULL`.

### 7.1 `worker_availability`
- `id UUID PK`, `worker_profile_id FK`, `day_of_week SMALLINT NULL CHECK (day_of_week BETWEEN 0 AND 6)`, `start_time TIME NULL`, `end_time TIME NULL`, `specific_date DATE NULL`, `is_available BOOLEAN DEFAULT TRUE`, `timezone VARCHAR(50) DEFAULT 'Asia/Karachi'`.

---

## Module 8: Addresses & PostGIS Geographic Locations

### 8.1 `addresses`
| Column | Type | Nullable | Default | Constraints / Description |
|---|---|:---:|---|---|
| `id` | UUID | No | `gen_random_uuid()` | Primary Key |
| `owner_user_id` | UUID | No | - | Foreign Key -> `users(id)` ON DELETE CASCADE |
| `address_type` | VARCHAR(20) | No | `'HOME'` | `HOME`, `WORK_SITE`, `OFFICE` |
| `street_address` | TEXT | Yes | NULL | Street or House details |
| `locality` | VARCHAR(120) | No | - | Neighborhood / Sector (e.g. F-10, Gulberg) |
| `city` | VARCHAR(100) | No | - | City (e.g. Islamabad, Lahore, Karachi) |
| `district` | VARCHAR(100) | Yes | NULL | Administrative District |
| `province` | VARCHAR(100) | No | - | Punjab, Sindh, KPK, Balochistan, ICT, GB, AJK |
| `country_code` | CHAR(2) | No | `'PK'` | ISO Country Code |
| `location` | `geography(Point, 4326)` | Yes | NULL | PostGIS WGS-84 Point (Longitude, Latitude) |
| `is_exact_private`| BOOLEAN | No | `TRUE` | Whether exact coordinates are shielded from public view |
| `created_at` | TIMESTAMPTZ | No | `NOW()` | Timestamp |
| `deleted_at` | TIMESTAMPTZ | Yes | NULL | Soft-deletion timestamp |

---

## Module 9, 10, 11 & 12: Marketplace, Jobs, Applications & Hires

### 9.1 `job_postings`
| Column | Type | Nullable | Default | Constraints / Description |
|---|---|:---:|---|---|
| `id` | UUID | No | `gen_random_uuid()` | Primary Key |
| `employer_profile_id`| UUID | No | - | Foreign Key -> `employer_profiles(id)` |
| `address_id` | UUID | No | - | Foreign Key -> `addresses(id)` |
| `category_id` | UUID | No | - | Foreign Key -> `categories(id)` |
| `title` | VARCHAR(200) | No | - | Requisition title |
| `description` | TEXT | No | - | Detailed job requirements |
| `engagement_type` | VARCHAR(20) | No | `'DAILY'` | `HOURLY`, `DAILY`, `PROJECT` |
| `pay_period` | VARCHAR(20) | No | `'DAILY'` | `HOURLY`, `DAILY`, `WEEKLY`, `MONTHLY`, `LUMP_SUM` |
| `pay_min_minor` | BIGINT | No | - | Minimum pay in PKR minor units (`CHECK >= 0`) |
| `pay_max_minor` | BIGINT | No | - | Maximum pay (`CHECK >= pay_min_minor`) |
| `currency` | CHAR(3) | No | `'PKR'` | ISO Currency code |
| `required_workers_count`| INT | No | 1 | Number of workers needed (`CHECK >= 1`) |
| `urgency_level` | VARCHAR(20) | No | `'NORMAL'` | `NORMAL`, `URGENT`, `EMERGENCY` |
| `start_date` | DATE | No | - | Work commencement date |
| `end_date` | DATE | Yes | NULL | Completion date |
| `status` | VARCHAR(32) | No | `'PUBLISHED'` | `DRAFT`, `PUBLISHED`, `IN_SELECTION`, `FILLED`, `COMPLETED`, `CANCELLED` |
| `created_at` | TIMESTAMPTZ | No | `NOW()` | Creation timestamp |
| `expires_at` | TIMESTAMPTZ | Yes | NULL | Auto-expiry timestamp |
| `deleted_at` | TIMESTAMPTZ | Yes | NULL | Soft-deletion timestamp |

### 10.1 `job_requirements`
| Column | Type | Nullable | Default | Constraints / Description |
|---|---|:---:|---|---|
| `id` | UUID | No | `gen_random_uuid()` | Primary Key |
| `job_posting_id` | UUID | No | - | Foreign Key -> `job_postings(id)` ON DELETE CASCADE |
| `skill_id` | UUID | Yes | NULL | Foreign Key -> `skills(id)` ON DELETE SET NULL |
| `requirement_type` | VARCHAR(32) | No | `'SKILL'` | `SKILL`, `CERTIFICATION`, `EXPERIENCE`, `LANGUAGE` |
| `description` | VARCHAR(255) | No | - | Human readable requirement |
| `is_mandatory` | BOOLEAN | No | `TRUE` | Hard constraint vs soft preference |
| `minimum_experience_months` | INT | Yes | NULL | Threshold for experience matching |

### 11.1 `job_applications` & `application_events`
- **`job_applications`**: `id UUID PK`, `job_posting_id FK`, `worker_profile_id FK`, `status` (`APPLIED`, `VIEWED`, `SHORTLISTED`, `HIRED`, `REJECTED`, `WITHDRAWN`), `expected_pay_minor BIGINT`, `cover_note TEXT`, `applied_at TIMESTAMPTZ`, `updated_at TIMESTAMPTZ`. Unique constraint: `UNIQUE(job_posting_id, worker_profile_id)`.
- **`application_events`**: `id UUID PK`, `job_application_id FK`, `actor_user_id FK`, `from_status VARCHAR(32)`, `to_status VARCHAR(32)`, `reason_note TEXT`, `created_at TIMESTAMPTZ`.

### 12.1 `hires`
- `id UUID PK`, `job_application_id UUID UNIQUE FK`, `employer_user_id FK`, `worker_user_id FK`, `agreed_pay_minor BIGINT`, `agreed_currency CHAR(3) DEFAULT 'PKR'`, `agreed_engagement_type VARCHAR(20)`, `start_date DATE`, `end_date DATE NULL`, `hired_at TIMESTAMPTZ`, `completed_at TIMESTAMPTZ NULL`, `status VARCHAR(32) DEFAULT 'ACTIVE'`.

---

## Module 13 & 14: AI Matching & Explainable AI (XAI)

### 13.1 `match_models`
| Column | Type | Nullable | Default | Constraints / Description |
|---|---|:---:|---|---|
| `id` | UUID | No | `gen_random_uuid()` | Primary Key |
| `model_name` | VARCHAR(100) | No | - | e.g. `LabourLens-Hybrid-Matcher` |
| `model_version` | VARCHAR(50) | No | - | Semantic version e.g. `v1.2.0` (UNIQUE) |
| `algorithm_type` | VARCHAR(50) | No | - | `RULE_BASED`, `GRADIENT_BOOSTED`, `HYBRID_EMBEDDING` |
| `parameters_jsonb` | JSONB | No | `'{}'` | Algorithm weights and thresholds |
| `is_active` | BOOLEAN | No | `TRUE` | Whether currently in production |
| `created_at` | TIMESTAMPTZ | No | `NOW()` | Version release timestamp |

### 13.2 `match_runs` & `match_results`
- **`match_runs`**: `id UUID PK`, `job_posting_id FK`, `match_model_id FK`, `status VARCHAR(32)`, `candidate_pool_size INT`, `executed_at TIMESTAMPTZ`, `expires_at TIMESTAMPTZ`.
- **`match_results`**: `id UUID PK`, `match_run_id FK`, `worker_profile_id FK`, `rank_order INT`, `compatibility_score NUMERIC(6,5) CHECK (compatibility_score BETWEEN 0 AND 1)`, `confidence_band VARCHAR(16)`, `created_at TIMESTAMPTZ`. Constraint: `UNIQUE(match_run_id, worker_profile_id)`.

### 14.1 `match_factors` (Explainable AI Attribution)
| Column | Type | Nullable | Default | Constraints / Description |
|---|---|:---:|---|---|
| `id` | UUID | No | `gen_random_uuid()` | Primary Key |
| `match_result_id` | UUID | No | - | Foreign Key -> `match_results(id)` ON DELETE CASCADE |
| `job_requirement_id`| UUID | Yes | NULL | Linked criterion if applicable |
| `factor_type` | VARCHAR(50) | No | - | `SKILL_FIT`, `EXPERIENCE_DEPTH`, `DISTANCE_PROXIMITY`, `SALARY_MATCH`, `AVAILABILITY_MATCH`, `MISSING_REQUIREMENT` |
| `score_contribution`| NUMERIC(6,5)| No | - | Contribution score (-1.00000 to +1.00000) |
| `weight` | NUMERIC(3,2)| No | - | Feature weight in composite model |
| `outcome` | VARCHAR(20) | No | - | `POSITIVE`, `NEUTRAL`, `NEGATIVE`, `DISQUALIFIED` |
| `human_explanation_en`| TEXT | No | - | Explanation in English |
| `human_explanation_ur`| TEXT | No | - | Explanation in Urdu |

### 14.2 `match_evaluations` & `match_evaluation_items`
- Tracks benchmark test dataset metrics (NDCG@3, Precision@3, sample sizes) for rigorous ML governance.

---

## Module 15 & 16: Verification, Trust, Reviews & Ratings

### 15.1 `verification_records`
| Column | Type | Nullable | Default | Constraints / Description |
|---|---|:---:|---|---|
| `id` | UUID | No | `gen_random_uuid()` | Primary Key |
| `user_id` | UUID | No | - | Foreign Key -> `users(id)` ON DELETE CASCADE |
| `verification_type` | VARCHAR(50) | No | - | `CNIC_NADRA`, `POLICE_VERIFICATION`, `DRIVING_LICENSE`, `VOCATIONAL_CERTIFICATE` |
| `verification_status`| VARCHAR(32) | No | `'PENDING'` | `PENDING`, `IN_REVIEW`, `VERIFIED`, `REJECTED`, `EXPIRED` |
| `document_reference_hash`| VARCHAR(128)| Yes | NULL | Cryptographic SHA-256 hash of evidence document |
| `verified_by_user_id`| UUID | Yes | NULL | Admin who reviewed document |
| `verified_at` | TIMESTAMPTZ | Yes | NULL | Verification date |
| `expires_at` | TIMESTAMPTZ | Yes | NULL | Expiration date of document |
| `rejection_reason` | TEXT | Yes | NULL | Explanation if rejected |

### 16.1 `reviews`
| Column | Type | Nullable | Default | Constraints / Description |
|---|---|:---:|---|---|
| `id` | UUID | No | `gen_random_uuid()` | Primary Key |
| `hire_id` | UUID | No | - | Foreign Key -> `hires(id)` ON DELETE RESTRICT |
| `author_user_id` | UUID | No | - | Foreign Key -> `users(id)` |
| `subject_user_id` | UUID | No | - | Foreign Key -> `users(id)` |
| `author_role` | VARCHAR(20) | No | - | `EMPLOYER`, `WORKER` |
| `rating_overall` | SMALLINT | No | - | `CHECK (rating_overall BETWEEN 1 AND 5)` |
| `rating_punctuality`| SMALLINT | Yes | NULL | Rating 1 to 5 |
| `rating_work_quality`| SMALLINT | Yes | NULL | Rating 1 to 5 |
| `review_text` | TEXT | Yes | NULL | Written feedback |
| `is_moderated` | BOOLEAN | No | `FALSE` | Flagged by automated content filter |
| `created_at` | TIMESTAMPTZ | No | `NOW()` | Creation timestamp |

---

## Module 17, 18, 19, 20 & 21: Communications, Governance & Payments

### 17.1 & 18.1 Messaging & Notifications
- **`conversations`**: `id UUID PK`, `job_posting_id FK NULL`, `created_at`, `updated_at`.
- **`conversation_participants`**: Composite PK `(conversation_id, user_id)`, `last_read_at TIMESTAMPTZ`.
- **`messages`**: `id UUID PK`, `conversation_id FK`, `sender_user_id FK`, `body TEXT`, `sent_at TIMESTAMPTZ`.
- **`notifications`**: `id UUID PK`, `recipient_user_id FK`, `notification_type VARCHAR(50)`, `title VARCHAR(200)`, `body TEXT`, `payload_jsonb JSONB`, `is_read BOOLEAN DEFAULT FALSE`, `created_at TIMESTAMPTZ`.

### 19.1 & 20.1 Complaints, Moderation & Audit Logs
- **`complaints`**: `id UUID PK`, `complainant_user_id FK`, `accused_user_id FK NULL`, `job_posting_id FK NULL`, `category VARCHAR(50)`, `severity VARCHAR(16)`, `description TEXT`, `status VARCHAR(32) DEFAULT 'OPEN'`.
- **`moderation_actions`**: `id UUID PK`, `complaint_id FK`, `admin_user_id FK`, `action_taken VARCHAR(50)`, `justification_note TEXT`, `created_at TIMESTAMPTZ`.
- **`audit_logs`**: `id UUID PK`, `actor_user_id FK NULL`, `action_verb VARCHAR(100)`, `target_entity_type VARCHAR(50)`, `target_entity_id UUID`, `ip_address VARCHAR(45)`, `sanitized_changes_jsonb JSONB`, `timestamp TIMESTAMPTZ DEFAULT NOW()`.

### 21.1 & 21.2 Payments & Transaction History
- **`payment_records`**: `id UUID PK`, `hire_id FK NULL`, `payer_user_id FK`, `payee_user_id FK`, `amount_minor BIGINT CHECK (amount_minor > 0)`, `currency CHAR(3) DEFAULT 'PKR'`, `payment_method VARCHAR(32)`, `payment_status VARCHAR(32)`, `external_reference_id VARCHAR(100) UNIQUE`, `created_at TIMESTAMPTZ`.
- **`payment_transactions`**: `id UUID PK`, `payment_record_id FK`, `transaction_type VARCHAR(32)`, `amount_minor BIGINT`, `status VARCHAR(32)`, `idempotency_key VARCHAR(100) UNIQUE`, `gateway_response_jsonb JSONB`, `created_at TIMESTAMPTZ`.
