/**
 * LabourLens Core Domain Types (Web Client)
 */

export type UserRole = "EMPLOYER" | "WORKER" | "ADMIN";

export type TradeCategory = "DOMESTIC" | "SKILLED";

export type EmploymentType = "HOURLY" | "DAILY" | "PROJECT";

export type VerificationTier =
  | "UNVERIFIED"
  | "CNIC_VERIFIED"
  | "POLICE_VERIFIED"
  | "FULLY_VERIFIED";

export type EvidenceType =
  | "VERIFIED_DOCUMENT"
  | "VERIFIED_EMPLOYER_REFERENCE"
  | "SELF_REPORTED"
  | "UNAVAILABLE";

export interface SkillItem {
  id: string;
  name: string;
  nameUr?: string;
  evidence: EvidenceType;
  yearsExperience?: number;
}

export interface WorkerCandidate {
  id: string;
  fullName: string;
  fullNameUr?: string;
  avatarUrl?: string;
  primaryTrade: string;
  primaryTradeUr?: string;
  category: TradeCategory;
  city: string;
  area: string;
  experienceYears: number;
  hourlyRatePkr?: number;
  dailyRatePkr?: number;
  monthlyRatePkr?: number;
  verificationTier: VerificationTier;
  averageRating: number;
  totalReviews: number;
  totalJobsCompleted: number;
  distanceKm?: number;
  skills: SkillItem[];
  availabilityStatus: "AVAILABLE" | "BUSY" | "ON_LEAVE";
  bio: string;
}

export interface ScoreBreakdown {
  skillScore: number;       // 0.0 - 1.0
  proximityScore: number;   // 0.0 - 1.0
  experienceScore: number;  // 0.0 - 1.0
  wageScore: number;        // 0.0 - 1.0
  availabilityScore: number;// 0.0 - 1.0
}

export interface XAIMatchResult {
  workerId: string;
  worker: WorkerCandidate;
  compositeScore: number; // 0.0 - 1.0
  breakdown: ScoreBreakdown;
  matchedRequirements: string[];
  missingRequirements: string[];
  positiveReasons: string[];
  missingReasons: string[];
  evidenceConfidence: number; // 0.0 - 1.0
  verificationTier: VerificationTier;
  safetyDisclaimer: string;
}

export interface JobListing {
  id: string;
  title: string;
  titleUr?: string;
  employerName: string;
  tradeCategory: string;
  employmentType: EmploymentType;
  budgetMinPkr: number;
  budgetMaxPkr: number;
  city: string;
  area: string;
  description: string;
  requiredSkills: string[];
  minExperienceYears: number;
  urgency: "NORMAL" | "URGENT";
  postedDate: string;
  status: "OPEN" | "SHORTLISTING" | "HIRED" | "COMPLETED";
  applicationsCount: number;
}

export interface ComplaintTicket {
  id: string;
  reporterName: string;
  reporterRole: UserRole;
  reportedName: string;
  reportedRole: UserRole;
  category: "MISCONDUCT" | "NON_PAYMENT" | "NO_SHOW" | "SAFETY_BREACH" | "FRAUD";
  description: string;
  dateReported: string;
  status: "OPEN" | "IN_REVIEW" | "RESOLVED" | "DISMISSED";
  severity: "LOW" | "MEDIUM" | "HIGH";
}
