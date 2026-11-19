-- Enable PostGIS extension for spatial queries
CREATE EXTENSION IF NOT EXISTS postgis;

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'MODERATOR', 'EMPLOYER', 'WORKER');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('PENDING_VERIFICATION', 'ACTIVE', 'SUSPENDED', 'BANNED', 'DEACTIVATED');

-- CreateEnum
CREATE TYPE "IdentityType" AS ENUM ('PHONE', 'EMAIL');

-- CreateEnum
CREATE TYPE "EmployerType" AS ENUM ('INDIVIDUAL_HOUSEHOLD', 'CONTRACTOR', 'ENTERPRISE', 'AGENCY');

-- CreateEnum
CREATE TYPE "VerificationLevel" AS ENUM ('UNVERIFIED', 'CNIC_VERIFIED', 'POLICE_VERIFIED', 'SKILL_TESTED');

-- CreateEnum
CREATE TYPE "ProfileVisibility" AS ENUM ('PUBLIC', 'REGISTERED_ONLY', 'PRIVATE');

-- CreateEnum
CREATE TYPE "EngagementType" AS ENUM ('HOURLY', 'DAILY', 'PROJECT', 'ANY');

-- CreateEnum
CREATE TYPE "PayPeriod" AS ENUM ('HOURLY', 'DAILY', 'WEEKLY', 'MONTHLY', 'LUMP_SUM');

-- CreateEnum
CREATE TYPE "UrgencyLevel" AS ENUM ('NORMAL', 'URGENT', 'EMERGENCY');

-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'IN_SELECTION', 'FILLED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "RequirementType" AS ENUM ('SKILL', 'CERTIFICATION', 'EXPERIENCE', 'LANGUAGE', 'PHYSICAL_FITNESS', 'GENDER_PREFERENCE');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('APPLIED', 'VIEWED', 'SHORTLISTED', 'INTERVIEW_SCHEDULED', 'HIRED', 'REJECTED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "HireStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'CANCELLED', 'DISPUTED');

-- CreateEnum
CREATE TYPE "CategoryType" AS ENUM ('DOMESTIC', 'SKILLED_TRADE', 'INDUSTRIAL');

-- CreateEnum
CREATE TYPE "EvidenceSource" AS ENUM ('SELF_DECLARED', 'ASSESSED', 'CERTIFIED', 'EMPLOYER_VERIFIED', 'SUPERVISOR_ENDORSED');

-- CreateEnum
CREATE TYPE "AddressType" AS ENUM ('HOME', 'WORK_SITE', 'OFFICE');

-- CreateEnum
CREATE TYPE "VerificationType" AS ENUM ('CNIC_NADRA', 'POLICE_VERIFICATION', 'DRIVING_LICENSE', 'VOCATIONAL_CERTIFICATE', 'PREVIOUS_EMPLOYER_REFERENCE');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('PENDING', 'IN_REVIEW', 'VERIFIED', 'REJECTED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "AlgorithmType" AS ENUM ('RULE_BASED', 'GRADIENT_BOOSTED', 'HYBRID_EMBEDDING');

-- CreateEnum
CREATE TYPE "MatchRunStatus" AS ENUM ('RUNNING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "ConfidenceBand" AS ENUM ('HIGH', 'MEDIUM', 'LOW');

-- CreateEnum
CREATE TYPE "MatchFactorCode" AS ENUM ('SKILL_FIT', 'EXPERIENCE_DEPTH', 'DISTANCE_PROXIMITY', 'SALARY_MATCH', 'AVAILABILITY_MATCH', 'MISSING_REQUIREMENT');

-- CreateEnum
CREATE TYPE "FactorOutcome" AS ENUM ('POSITIVE', 'NEUTRAL', 'NEGATIVE', 'DISQUALIFIED');

-- CreateEnum
CREATE TYPE "ExtractionStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "ExtractionReviewStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'EDITED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('APPLICATION_RECEIVED', 'APPLICATION_SHORTLISTED', 'APPLICATION_ACCEPTED', 'HIRE_CONFIRMED', 'NEW_MESSAGE', 'PAYMENT_RECEIVED', 'REVIEW_SUBMITTED', 'SAFETY_ALERT', 'SYSTEM_ANNOUNCEMENT');

-- CreateEnum
CREATE TYPE "ComplaintCategory" AS ENUM ('NON_PAYMENT', 'NO_SHOW', 'HARASSMENT', 'SAFETY_HAZARD', 'PROPERTY_DAMAGE', 'MISREPRESENTATION', 'OTHER');

-- CreateEnum
CREATE TYPE "SeverityLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "ComplaintStatus" AS ENUM ('OPEN', 'INVESTIGATING', 'RESOLVED', 'DISMISSED');

-- CreateEnum
CREATE TYPE "ModerationActionType" AS ENUM ('WARNING_ISSUED', 'PROFILE_SUSPENDED', 'ACCOUNT_BANNED', 'COMPLAINT_DISMISSED', 'NOTE_ADDED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH_VOUCHER', 'JAZZCASH', 'EASYPAISA', 'RAAST', 'BANK_TRANSFER');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'HELD_IN_ESCROW', 'RELEASED', 'REFUNDED', 'FAILED');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('CHARGE', 'PAYOUT', 'REFUND', 'ESCROW_DEPOSIT', 'ESCROW_RELEASE');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('INITIATED', 'PROCESSING', 'SUCCEEDED', 'FAILED');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "preferred_locale" VARCHAR(10) NOT NULL DEFAULT 'ur-PK',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_identities" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "identity_type" "IdentityType" NOT NULL,
    "normalized_value" VARCHAR(320) NOT NULL,
    "password_hash" VARCHAR(255),
    "is_primary" BOOLEAN NOT NULL DEFAULT true,
    "verified_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_identities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth_sessions" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "token_hash" BYTEA NOT NULL,
    "user_agent" TEXT,
    "ip_address_hash" VARCHAR(64),
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "revoked_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auth_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_reset_tokens" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "token_hash" BYTEA NOT NULL,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "consumed_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" UUID NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permissions" (
    "id" UUID NOT NULL,
    "code" VARCHAR(100) NOT NULL,
    "description" TEXT,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_role_assignments" (
    "user_id" UUID NOT NULL,
    "role_id" UUID NOT NULL,
    "assigned_by_user_id" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_role_assignments_pkey" PRIMARY KEY ("user_id","role_id")
);

-- CreateTable
CREATE TABLE "role_permissions" (
    "role_id" UUID NOT NULL,
    "permission_id" UUID NOT NULL,

    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("role_id","permission_id")
);

-- CreateTable
CREATE TABLE "employer_profiles" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "display_name" VARCHAR(160) NOT NULL,
    "employer_type" "EmployerType" NOT NULL DEFAULT 'INDIVIDUAL_HOUSEHOLD',
    "ntn_tax_number" VARCHAR(50),
    "description" TEXT,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "employer_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "worker_profiles" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "display_name" VARCHAR(160) NOT NULL,
    "gender" VARCHAR(16),
    "date_of_birth" DATE,
    "primary_category_id" UUID,
    "bio" TEXT,
    "experience_months" INTEGER NOT NULL DEFAULT 0,
    "expected_wage_hourly_minor" BIGINT,
    "expected_wage_daily_minor" BIGINT,
    "expected_wage_monthly_minor" BIGINT,
    "preferred_engagement_type" "EngagementType" NOT NULL DEFAULT 'ANY',
    "verification_level" "VerificationLevel" NOT NULL DEFAULT 'UNVERIFIED',
    "profile_visibility" "ProfileVisibility" NOT NULL DEFAULT 'PUBLIC',
    "is_available" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "worker_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" UUID NOT NULL,
    "parent_id" UUID,
    "code" VARCHAR(50) NOT NULL,
    "name_en" VARCHAR(120) NOT NULL,
    "name_ur" VARCHAR(120) NOT NULL,
    "category_type" "CategoryType" NOT NULL DEFAULT 'DOMESTIC',
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "skills" (
    "id" UUID NOT NULL,
    "category_id" UUID NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name_en" VARCHAR(120) NOT NULL,
    "name_ur" VARCHAR(120) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "worker_skills" (
    "worker_profile_id" UUID NOT NULL,
    "skill_id" UUID NOT NULL,
    "proficiency_level" SMALLINT NOT NULL DEFAULT 3,
    "experience_months" INTEGER NOT NULL DEFAULT 12,
    "evidence_source" "EvidenceSource" NOT NULL DEFAULT 'SELF_DECLARED',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "worker_skills_pkey" PRIMARY KEY ("worker_profile_id","skill_id")
);

-- CreateTable
CREATE TABLE "worker_experiences" (
    "id" UUID NOT NULL,
    "worker_profile_id" UUID NOT NULL,
    "role_title" VARCHAR(120) NOT NULL,
    "employer_name" VARCHAR(160),
    "city" VARCHAR(100),
    "started_on" DATE NOT NULL,
    "ended_on" DATE,
    "is_current" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "evidence_source" "EvidenceSource" NOT NULL DEFAULT 'SELF_DECLARED',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "worker_experiences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "worker_qualifications" (
    "id" UUID NOT NULL,
    "worker_profile_id" UUID NOT NULL,
    "title" VARCHAR(160) NOT NULL,
    "issuer" VARCHAR(160),
    "issued_on" DATE,
    "expires_on" DATE,
    "evidence_source" "EvidenceSource" NOT NULL DEFAULT 'SELF_DECLARED',
    "verification_record_id" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "worker_qualifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "worker_availability" (
    "id" UUID NOT NULL,
    "worker_profile_id" UUID NOT NULL,
    "day_of_week" SMALLINT,
    "start_time" TIME(0),
    "end_time" TIME(0),
    "specific_date" DATE,
    "is_available" BOOLEAN NOT NULL DEFAULT true,
    "engagement_preference" "EngagementType" NOT NULL DEFAULT 'ANY',
    "timezone" VARCHAR(50) NOT NULL DEFAULT 'Asia/Karachi',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "worker_availability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "addresses" (
    "id" UUID NOT NULL,
    "owner_user_id" UUID NOT NULL,
    "address_type" "AddressType" NOT NULL DEFAULT 'HOME',
    "street_address" TEXT,
    "locality" VARCHAR(120) NOT NULL,
    "city" VARCHAR(100) NOT NULL,
    "district" VARCHAR(100),
    "province" VARCHAR(100) NOT NULL,
    "postal_code" VARCHAR(20),
    "country_code" CHAR(2) NOT NULL DEFAULT 'PK',
    "location" geography(Point, 4326),
    "approximate_latitude" DECIMAL(9,6),
    "approximate_longitude" DECIMAL(9,6),
    "is_exact_private" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "addresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_postings" (
    "id" UUID NOT NULL,
    "employer_profile_id" UUID NOT NULL,
    "address_id" UUID NOT NULL,
    "category_id" UUID NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "description" TEXT NOT NULL,
    "engagement_type" "EngagementType" NOT NULL DEFAULT 'DAILY',
    "pay_period" "PayPeriod" NOT NULL DEFAULT 'DAILY',
    "pay_min_minor" BIGINT NOT NULL,
    "pay_max_minor" BIGINT NOT NULL,
    "currency" CHAR(3) NOT NULL DEFAULT 'PKR',
    "required_workers_count" INTEGER NOT NULL DEFAULT 1,
    "urgency_level" "UrgencyLevel" NOT NULL DEFAULT 'NORMAL',
    "start_date" DATE NOT NULL,
    "end_date" DATE,
    "status" "JobStatus" NOT NULL DEFAULT 'PUBLISHED',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "expires_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "job_postings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_requirements" (
    "id" UUID NOT NULL,
    "job_posting_id" UUID NOT NULL,
    "skill_id" UUID,
    "requirement_type" "RequirementType" NOT NULL DEFAULT 'SKILL',
    "description" VARCHAR(255) NOT NULL,
    "is_mandatory" BOOLEAN NOT NULL DEFAULT true,
    "minimum_experience_months" INTEGER,
    "importance_weight" DECIMAL(3,2) NOT NULL DEFAULT 1.0,

    CONSTRAINT "job_requirements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_applications" (
    "id" UUID NOT NULL,
    "job_posting_id" UUID NOT NULL,
    "worker_profile_id" UUID NOT NULL,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'APPLIED',
    "expected_pay_minor" BIGINT,
    "cover_message" TEXT,
    "applied_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "job_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "application_events" (
    "id" UUID NOT NULL,
    "job_application_id" UUID NOT NULL,
    "actor_user_id" UUID NOT NULL,
    "from_status" "ApplicationStatus" NOT NULL,
    "to_status" "ApplicationStatus" NOT NULL,
    "reason_note" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "application_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hires" (
    "id" UUID NOT NULL,
    "job_application_id" UUID NOT NULL,
    "employer_user_id" UUID NOT NULL,
    "worker_user_id" UUID NOT NULL,
    "agreed_engagement_type" "EngagementType" NOT NULL,
    "agreed_pay_minor" BIGINT NOT NULL,
    "agreed_currency" CHAR(3) NOT NULL DEFAULT 'PKR',
    "agreed_pay_period" "PayPeriod" NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE,
    "status" "HireStatus" NOT NULL DEFAULT 'ACTIVE',
    "hired_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMPTZ(6),
    "cancelled_at" TIMESTAMPTZ(6),

    CONSTRAINT "hires_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "requirement_extraction_runs" (
    "id" UUID NOT NULL,
    "job_posting_id" UUID NOT NULL,
    "extractor_version" VARCHAR(50) NOT NULL,
    "source_text_hash" VARCHAR(64) NOT NULL,
    "status" "ExtractionStatus" NOT NULL DEFAULT 'COMPLETED',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "requirement_extraction_runs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "extracted_requirements" (
    "id" UUID NOT NULL,
    "run_id" UUID NOT NULL,
    "raw_text" TEXT NOT NULL,
    "skill_id" UUID,
    "is_mandatory" BOOLEAN NOT NULL DEFAULT true,
    "confidence_score" DECIMAL(6,5) NOT NULL,
    "review_status" "ExtractionReviewStatus" NOT NULL DEFAULT 'PENDING',
    "accepted_requirement_id" UUID,

    CONSTRAINT "extracted_requirements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "match_models" (
    "id" UUID NOT NULL,
    "model_name" VARCHAR(100) NOT NULL,
    "model_version" VARCHAR(50) NOT NULL,
    "algorithm_type" "AlgorithmType" NOT NULL,
    "parameters_json" JSONB NOT NULL DEFAULT '{}',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "match_models_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "match_runs" (
    "id" UUID NOT NULL,
    "job_posting_id" UUID NOT NULL,
    "match_model_id" UUID NOT NULL,
    "status" "MatchRunStatus" NOT NULL DEFAULT 'COMPLETED',
    "candidate_pool_size" INTEGER NOT NULL DEFAULT 0,
    "input_snapshot_json" JSONB,
    "executed_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "match_runs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "match_results" (
    "id" UUID NOT NULL,
    "match_run_id" UUID NOT NULL,
    "worker_profile_id" UUID NOT NULL,
    "rank_order" INTEGER NOT NULL,
    "overall_score" DECIMAL(6,5) NOT NULL,
    "confidence_band" "ConfidenceBand" NOT NULL,
    "is_shortlisted_by_employer" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "match_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "match_factors" (
    "id" UUID NOT NULL,
    "match_result_id" UUID NOT NULL,
    "job_requirement_id" UUID,
    "factor_code" "MatchFactorCode" NOT NULL,
    "score_contribution" DECIMAL(6,5) NOT NULL,
    "weight" DECIMAL(3,2) NOT NULL,
    "outcome" "FactorOutcome" NOT NULL,
    "evidence_source" "EvidenceSource" NOT NULL DEFAULT 'SELF_DECLARED',
    "explanation_en" TEXT NOT NULL,
    "explanation_ur" TEXT NOT NULL,

    CONSTRAINT "match_factors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "match_evaluations" (
    "id" UUID NOT NULL,
    "match_model_id" UUID NOT NULL,
    "dataset_version" VARCHAR(50) NOT NULL,
    "methodology" VARCHAR(100) NOT NULL,
    "precision_at_3" DECIMAL(6,5),
    "ndcg_at_3" DECIMAL(6,5),
    "sample_count" INTEGER NOT NULL,
    "evaluated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "match_evaluations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "match_evaluation_items" (
    "id" UUID NOT NULL,
    "evaluation_id" UUID NOT NULL,
    "job_id" UUID,
    "worker_id" UUID,
    "relevance_score" DECIMAL(3,2) NOT NULL,
    "predicted_rank" INTEGER NOT NULL,

    CONSTRAINT "match_evaluation_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_records" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "verification_type" "VerificationType" NOT NULL,
    "verification_status" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "document_reference_hash" VARCHAR(128),
    "verified_by_user_id" UUID,
    "verified_at" TIMESTAMPTZ(6),
    "expires_at" TIMESTAMPTZ(6),
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "verification_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" UUID NOT NULL,
    "hire_id" UUID NOT NULL,
    "author_user_id" UUID NOT NULL,
    "subject_user_id" UUID NOT NULL,
    "author_role" "UserRole" NOT NULL,
    "rating_overall" SMALLINT NOT NULL,
    "rating_punctuality" SMALLINT,
    "rating_work_quality" SMALLINT,
    "rating_safety" SMALLINT,
    "comment" TEXT,
    "is_moderated" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversations" (
    "id" UUID NOT NULL,
    "job_posting_id" UUID,
    "is_closed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversation_participants" (
    "conversation_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "last_read_at" TIMESTAMPTZ(6),
    "joined_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "conversation_participants_pkey" PRIMARY KEY ("conversation_id","user_id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" UUID NOT NULL,
    "conversation_id" UUID NOT NULL,
    "sender_user_id" UUID NOT NULL,
    "body" TEXT NOT NULL,
    "is_system_message" BOOLEAN NOT NULL DEFAULT false,
    "sent_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" UUID NOT NULL,
    "recipient_user_id" UUID NOT NULL,
    "notification_type" "NotificationType" NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "body" TEXT NOT NULL,
    "payload_json" JSONB,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "read_at" TIMESTAMPTZ(6),
    "expires_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "complaints" (
    "id" UUID NOT NULL,
    "complainant_user_id" UUID NOT NULL,
    "accused_user_id" UUID,
    "job_posting_id" UUID,
    "category" "ComplaintCategory" NOT NULL,
    "severity" "SeverityLevel" NOT NULL DEFAULT 'MEDIUM',
    "description" TEXT NOT NULL,
    "status" "ComplaintStatus" NOT NULL DEFAULT 'OPEN',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "complaints_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "moderation_actions" (
    "id" UUID NOT NULL,
    "complaint_id" UUID NOT NULL,
    "admin_user_id" UUID NOT NULL,
    "action_taken" "ModerationActionType" NOT NULL,
    "justification_note" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "moderation_actions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL,
    "actor_user_id" UUID,
    "action_verb" VARCHAR(100) NOT NULL,
    "target_entity_type" VARCHAR(50) NOT NULL,
    "target_entity_id" UUID,
    "ip_address" VARCHAR(45),
    "sanitized_changes_json" JSONB,
    "timestamp" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_records" (
    "id" UUID NOT NULL,
    "hire_id" UUID,
    "payer_user_id" UUID NOT NULL,
    "payee_user_id" UUID NOT NULL,
    "amount_minor" BIGINT NOT NULL,
    "currency" CHAR(3) NOT NULL DEFAULT 'PKR',
    "payment_method" "PaymentMethod" NOT NULL DEFAULT 'CASH_VOUCHER',
    "payment_status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "external_reference_id" VARCHAR(100),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "payment_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_transactions" (
    "id" UUID NOT NULL,
    "payment_record_id" UUID NOT NULL,
    "transaction_type" "TransactionType" NOT NULL,
    "amount_minor" BIGINT NOT NULL,
    "currency" CHAR(3) NOT NULL DEFAULT 'PKR',
    "status" "TransactionStatus" NOT NULL,
    "idempotency_key" VARCHAR(100) NOT NULL,
    "gateway_response_json" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_identities_normalized_value_key" ON "user_identities"("normalized_value");

-- CreateIndex
CREATE INDEX "user_identities_user_id_idx" ON "user_identities"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "auth_sessions_token_hash_key" ON "auth_sessions"("token_hash");

-- CreateIndex
CREATE INDEX "auth_sessions_user_id_idx" ON "auth_sessions"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_tokens_token_hash_key" ON "password_reset_tokens"("token_hash");

-- CreateIndex
CREATE INDEX "password_reset_tokens_user_id_idx" ON "password_reset_tokens"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "roles_code_key" ON "roles"("code");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_code_key" ON "permissions"("code");

-- CreateIndex
CREATE UNIQUE INDEX "employer_profiles_user_id_key" ON "employer_profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "worker_profiles_user_id_key" ON "worker_profiles"("user_id");

-- CreateIndex
CREATE INDEX "worker_profiles_primary_category_id_idx" ON "worker_profiles"("primary_category_id");

-- CreateIndex
CREATE INDEX "worker_profiles_is_available_profile_visibility_idx" ON "worker_profiles"("is_available", "profile_visibility");

-- CreateIndex
CREATE UNIQUE INDEX "categories_code_key" ON "categories"("code");

-- CreateIndex
CREATE UNIQUE INDEX "skills_code_key" ON "skills"("code");

-- CreateIndex
CREATE INDEX "skills_category_id_idx" ON "skills"("category_id");

-- CreateIndex
CREATE INDEX "worker_skills_skill_id_worker_profile_id_idx" ON "worker_skills"("skill_id", "worker_profile_id");

-- CreateIndex
CREATE INDEX "worker_experiences_worker_profile_id_idx" ON "worker_experiences"("worker_profile_id");

-- CreateIndex
CREATE INDEX "worker_qualifications_worker_profile_id_idx" ON "worker_qualifications"("worker_profile_id");

-- CreateIndex
CREATE INDEX "worker_availability_worker_profile_id_is_available_idx" ON "worker_availability"("worker_profile_id", "is_available");

-- CreateIndex
CREATE INDEX "addresses_owner_user_id_idx" ON "addresses"("owner_user_id");

-- CreateIndex
CREATE INDEX "addresses_city_locality_idx" ON "addresses"("city", "locality");

-- CreateIndex
CREATE INDEX "job_postings_status_category_id_created_at_idx" ON "job_postings"("status", "category_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "job_postings_employer_profile_id_idx" ON "job_postings"("employer_profile_id");

-- CreateIndex
CREATE INDEX "job_requirements_job_posting_id_idx" ON "job_requirements"("job_posting_id");

-- CreateIndex
CREATE INDEX "job_applications_worker_profile_id_status_idx" ON "job_applications"("worker_profile_id", "status");

-- CreateIndex
CREATE INDEX "job_applications_job_posting_id_status_applied_at_idx" ON "job_applications"("job_posting_id", "status", "applied_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "job_applications_job_posting_id_worker_profile_id_key" ON "job_applications"("job_posting_id", "worker_profile_id");

-- CreateIndex
CREATE INDEX "application_events_job_application_id_created_at_idx" ON "application_events"("job_application_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "hires_job_application_id_key" ON "hires"("job_application_id");

-- CreateIndex
CREATE INDEX "hires_employer_user_id_idx" ON "hires"("employer_user_id");

-- CreateIndex
CREATE INDEX "hires_worker_user_id_idx" ON "hires"("worker_user_id");

-- CreateIndex
CREATE INDEX "requirement_extraction_runs_job_posting_id_idx" ON "requirement_extraction_runs"("job_posting_id");

-- CreateIndex
CREATE INDEX "extracted_requirements_run_id_idx" ON "extracted_requirements"("run_id");

-- CreateIndex
CREATE UNIQUE INDEX "match_models_model_version_key" ON "match_models"("model_version");

-- CreateIndex
CREATE INDEX "match_runs_job_posting_id_executed_at_idx" ON "match_runs"("job_posting_id", "executed_at" DESC);

-- CreateIndex
CREATE INDEX "match_results_worker_profile_id_idx" ON "match_results"("worker_profile_id");

-- CreateIndex
CREATE UNIQUE INDEX "match_results_match_run_id_worker_profile_id_key" ON "match_results"("match_run_id", "worker_profile_id");

-- CreateIndex
CREATE UNIQUE INDEX "match_results_match_run_id_rank_order_key" ON "match_results"("match_run_id", "rank_order");

-- CreateIndex
CREATE INDEX "match_factors_match_result_id_idx" ON "match_factors"("match_result_id");

-- CreateIndex
CREATE INDEX "match_evaluation_items_evaluation_id_idx" ON "match_evaluation_items"("evaluation_id");

-- CreateIndex
CREATE INDEX "verification_records_user_id_verification_status_idx" ON "verification_records"("user_id", "verification_status");

-- CreateIndex
CREATE INDEX "reviews_subject_user_id_rating_overall_idx" ON "reviews"("subject_user_id", "rating_overall");

-- CreateIndex
CREATE UNIQUE INDEX "reviews_hire_id_author_user_id_subject_user_id_key" ON "reviews"("hire_id", "author_user_id", "subject_user_id");

-- CreateIndex
CREATE INDEX "conversations_job_posting_id_idx" ON "conversations"("job_posting_id");

-- CreateIndex
CREATE INDEX "messages_conversation_id_sent_at_idx" ON "messages"("conversation_id", "sent_at");

-- CreateIndex
CREATE INDEX "notifications_recipient_user_id_is_read_created_at_idx" ON "notifications"("recipient_user_id", "is_read", "created_at" DESC);

-- CreateIndex
CREATE INDEX "complaints_complainant_user_id_idx" ON "complaints"("complainant_user_id");

-- CreateIndex
CREATE INDEX "complaints_accused_user_id_idx" ON "complaints"("accused_user_id");

-- CreateIndex
CREATE INDEX "complaints_status_severity_idx" ON "complaints"("status", "severity");

-- CreateIndex
CREATE INDEX "moderation_actions_complaint_id_idx" ON "moderation_actions"("complaint_id");

-- CreateIndex
CREATE INDEX "audit_logs_target_entity_type_target_entity_id_timestamp_idx" ON "audit_logs"("target_entity_type", "target_entity_id", "timestamp" DESC);

-- CreateIndex
CREATE INDEX "audit_logs_actor_user_id_timestamp_idx" ON "audit_logs"("actor_user_id", "timestamp" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "payment_records_external_reference_id_key" ON "payment_records"("external_reference_id");

-- CreateIndex
CREATE INDEX "payment_records_payer_user_id_idx" ON "payment_records"("payer_user_id");

-- CreateIndex
CREATE INDEX "payment_records_payee_user_id_idx" ON "payment_records"("payee_user_id");

-- CreateIndex
CREATE INDEX "payment_records_payment_status_idx" ON "payment_records"("payment_status");

-- CreateIndex
CREATE UNIQUE INDEX "payment_transactions_idempotency_key_key" ON "payment_transactions"("idempotency_key");

-- CreateIndex
CREATE INDEX "payment_transactions_payment_record_id_idx" ON "payment_transactions"("payment_record_id");

-- AddForeignKey
ALTER TABLE "user_identities" ADD CONSTRAINT "user_identities_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth_sessions" ADD CONSTRAINT "auth_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_role_assignments" ADD CONSTRAINT "user_role_assignments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_role_assignments" ADD CONSTRAINT "user_role_assignments_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_role_assignments" ADD CONSTRAINT "user_role_assignments_assigned_by_user_id_fkey" FOREIGN KEY ("assigned_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employer_profiles" ADD CONSTRAINT "employer_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "worker_profiles" ADD CONSTRAINT "worker_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "worker_profiles" ADD CONSTRAINT "worker_profiles_primary_category_id_fkey" FOREIGN KEY ("primary_category_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skills" ADD CONSTRAINT "skills_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "worker_skills" ADD CONSTRAINT "worker_skills_worker_profile_id_fkey" FOREIGN KEY ("worker_profile_id") REFERENCES "worker_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "worker_skills" ADD CONSTRAINT "worker_skills_skill_id_fkey" FOREIGN KEY ("skill_id") REFERENCES "skills"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "worker_experiences" ADD CONSTRAINT "worker_experiences_worker_profile_id_fkey" FOREIGN KEY ("worker_profile_id") REFERENCES "worker_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "worker_qualifications" ADD CONSTRAINT "worker_qualifications_worker_profile_id_fkey" FOREIGN KEY ("worker_profile_id") REFERENCES "worker_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "worker_qualifications" ADD CONSTRAINT "worker_qualifications_verification_record_id_fkey" FOREIGN KEY ("verification_record_id") REFERENCES "verification_records"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "worker_availability" ADD CONSTRAINT "worker_availability_worker_profile_id_fkey" FOREIGN KEY ("worker_profile_id") REFERENCES "worker_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_owner_user_id_fkey" FOREIGN KEY ("owner_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_postings" ADD CONSTRAINT "job_postings_employer_profile_id_fkey" FOREIGN KEY ("employer_profile_id") REFERENCES "employer_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_postings" ADD CONSTRAINT "job_postings_address_id_fkey" FOREIGN KEY ("address_id") REFERENCES "addresses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_postings" ADD CONSTRAINT "job_postings_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_requirements" ADD CONSTRAINT "job_requirements_job_posting_id_fkey" FOREIGN KEY ("job_posting_id") REFERENCES "job_postings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_requirements" ADD CONSTRAINT "job_requirements_skill_id_fkey" FOREIGN KEY ("skill_id") REFERENCES "skills"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_applications" ADD CONSTRAINT "job_applications_job_posting_id_fkey" FOREIGN KEY ("job_posting_id") REFERENCES "job_postings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_applications" ADD CONSTRAINT "job_applications_worker_profile_id_fkey" FOREIGN KEY ("worker_profile_id") REFERENCES "worker_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application_events" ADD CONSTRAINT "application_events_job_application_id_fkey" FOREIGN KEY ("job_application_id") REFERENCES "job_applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application_events" ADD CONSTRAINT "application_events_actor_user_id_fkey" FOREIGN KEY ("actor_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hires" ADD CONSTRAINT "hires_job_application_id_fkey" FOREIGN KEY ("job_application_id") REFERENCES "job_applications"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hires" ADD CONSTRAINT "hires_employer_user_id_fkey" FOREIGN KEY ("employer_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hires" ADD CONSTRAINT "hires_worker_user_id_fkey" FOREIGN KEY ("worker_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requirement_extraction_runs" ADD CONSTRAINT "requirement_extraction_runs_job_posting_id_fkey" FOREIGN KEY ("job_posting_id") REFERENCES "job_postings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "extracted_requirements" ADD CONSTRAINT "extracted_requirements_run_id_fkey" FOREIGN KEY ("run_id") REFERENCES "requirement_extraction_runs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "extracted_requirements" ADD CONSTRAINT "extracted_requirements_skill_id_fkey" FOREIGN KEY ("skill_id") REFERENCES "skills"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_runs" ADD CONSTRAINT "match_runs_job_posting_id_fkey" FOREIGN KEY ("job_posting_id") REFERENCES "job_postings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_runs" ADD CONSTRAINT "match_runs_match_model_id_fkey" FOREIGN KEY ("match_model_id") REFERENCES "match_models"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_results" ADD CONSTRAINT "match_results_match_run_id_fkey" FOREIGN KEY ("match_run_id") REFERENCES "match_runs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_results" ADD CONSTRAINT "match_results_worker_profile_id_fkey" FOREIGN KEY ("worker_profile_id") REFERENCES "worker_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_factors" ADD CONSTRAINT "match_factors_match_result_id_fkey" FOREIGN KEY ("match_result_id") REFERENCES "match_results"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_factors" ADD CONSTRAINT "match_factors_job_requirement_id_fkey" FOREIGN KEY ("job_requirement_id") REFERENCES "job_requirements"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_evaluations" ADD CONSTRAINT "match_evaluations_match_model_id_fkey" FOREIGN KEY ("match_model_id") REFERENCES "match_models"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_evaluation_items" ADD CONSTRAINT "match_evaluation_items_evaluation_id_fkey" FOREIGN KEY ("evaluation_id") REFERENCES "match_evaluations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "verification_records" ADD CONSTRAINT "verification_records_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "verification_records" ADD CONSTRAINT "verification_records_verified_by_user_id_fkey" FOREIGN KEY ("verified_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_hire_id_fkey" FOREIGN KEY ("hire_id") REFERENCES "hires"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_author_user_id_fkey" FOREIGN KEY ("author_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_subject_user_id_fkey" FOREIGN KEY ("subject_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_job_posting_id_fkey" FOREIGN KEY ("job_posting_id") REFERENCES "job_postings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation_participants" ADD CONSTRAINT "conversation_participants_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation_participants" ADD CONSTRAINT "conversation_participants_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_user_id_fkey" FOREIGN KEY ("sender_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_recipient_user_id_fkey" FOREIGN KEY ("recipient_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "complaints" ADD CONSTRAINT "complaints_complainant_user_id_fkey" FOREIGN KEY ("complainant_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "complaints" ADD CONSTRAINT "complaints_accused_user_id_fkey" FOREIGN KEY ("accused_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "complaints" ADD CONSTRAINT "complaints_job_posting_id_fkey" FOREIGN KEY ("job_posting_id") REFERENCES "job_postings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "moderation_actions" ADD CONSTRAINT "moderation_actions_complaint_id_fkey" FOREIGN KEY ("complaint_id") REFERENCES "complaints"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "moderation_actions" ADD CONSTRAINT "moderation_actions_admin_user_id_fkey" FOREIGN KEY ("admin_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_user_id_fkey" FOREIGN KEY ("actor_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_records" ADD CONSTRAINT "payment_records_hire_id_fkey" FOREIGN KEY ("hire_id") REFERENCES "hires"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_records" ADD CONSTRAINT "payment_records_payer_user_id_fkey" FOREIGN KEY ("payer_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_records" ADD CONSTRAINT "payment_records_payee_user_id_fkey" FOREIGN KEY ("payee_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_transactions" ADD CONSTRAINT "payment_transactions_payment_record_id_fkey" FOREIGN KEY ("payment_record_id") REFERENCES "payment_records"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- PostGIS GiST Spatial Index on Addresses
CREATE INDEX IF NOT EXISTS "addresses_location_gist_idx" ON "addresses" USING GIST ("location");

