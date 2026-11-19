-- CreateEnum
CREATE TYPE "AvailabilityStatus" AS ENUM ('AVAILABLE', 'BUSY', 'UNAVAILABLE');

-- AlterTable
ALTER TABLE "employer_profiles" ADD COLUMN     "business_name" VARCHAR(160),
ADD COLUMN     "hiring_preferences" JSONB,
ADD COLUMN     "profile_picture_url" TEXT;

-- AlterTable
ALTER TABLE "worker_profiles" ADD COLUMN     "availability_status" "AvailabilityStatus" NOT NULL DEFAULT 'AVAILABLE',
ADD COLUMN     "headline" VARCHAR(160),
ADD COLUMN     "languages" TEXT[] DEFAULT ARRAY['ur-PK']::TEXT[],
ADD COLUMN     "portfolio_items" JSONB,
ADD COLUMN     "profile_picture_url" TEXT;

-- AlterTable
ALTER TABLE "worker_qualifications" ADD COLUMN     "credential_url" TEXT,
ADD COLUMN     "qualification_type" VARCHAR(50) NOT NULL DEFAULT 'CERTIFICATION';
