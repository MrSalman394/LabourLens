# LabourLens — Unified API Contracts Specification
**Version**: 1.0.0 (REST v1)  
**Base URL**: `/api/v1`  
**Shared Clients**: Next.js Web Portal (`apps/web`) & Flutter Mobile Client (`apps/mobile`)  
**Auth Scheme**: Bearer JWT (`Authorization: Bearer <access_token>`) & Secure HTTP-only refresh cookie  
**Response Standard**: Envelope format `{ "success": boolean, "data": T, "meta"?: object, "error"?: { "code": string, "message": string } }`

---

## 1. Authentication & Identity (`/auth`)

LabourLens implements enterprise authentication and authorization using stateless JSON Web Tokens (JWT) for access (15-minute expiration) and single-use, SHA-256 hashed cryptographically secure refresh tokens stored in PostgreSQL (`auth_sessions`). Passwords are hashed using Argon2id (OWASP parameters: 64MB memory, 3 iterations, 4 parallelism, with backwards-compatible bcrypt verification fallback). All endpoints strictly enforce `class-validator` schemas, rate limits, and zero client-side `localStorage` token storage.

### 1.1 Employer Registration
- **Endpoint**: `POST /auth/register/employer`
- **Access**: Public
- **Rate Limit**: 10 requests / 60 seconds
- **Request Headers**: `Content-Type: application/json`
- **Request Payload**:
```json
{
  "email": "apex.builder@example.pk",
  "password": "StrongPassword123!",
  "displayName": "Apex Construction Pvt Ltd",
  "employerType": "CONTRACTOR",
  "phone": "+923001234567",
  "ntnTaxNumber": "1234567-8",
  "description": "Commercial and residential building contractor in Islamabad"
}
```
- **Validation Rules**:
  - `email`: Valid email format, lowercase normalized, unique.
  - `password`: Minimum 8 characters, at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character (`@$!%*?&`).
  - `displayName`: String, 2-100 characters.
  - `employerType`: Enum (`INDIVIDUAL`, `CONTRACTOR`, `ENTERPRISE`, `AGENCY`).
  - `phone`: Optional E.164 phone string.
- **Response (201 Created)**:
```json
{
  "user": {
    "id": "a91c0b09-6d2d-4ae1-8087-d916badd70ea",
    "email": "apex.builder@example.pk",
    "roles": ["EMPLOYER"],
    "status": "ACTIVE",
    "createdAt": "2026-11-16T18:34:09.000Z",
    "employerProfile": {
      "id": "2d1b7e40-02e7-4402-98aa-f39b69b4e850",
      "companyName": "Apex Construction Pvt Ltd",
      "employerType": "CONTRACTOR",
      "contactPhone": "+923001234567",
      "isVerified": false
    }
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "7d9b9a5462cf640ebc191a27e...",
  "tokenType": "Bearer",
  "expiresIn": 900
}
```

### 1.2 Worker Registration
- **Endpoint**: `POST /auth/register/worker`
- **Access**: Public
- **Rate Limit**: 10 requests / 60 seconds
- **Request Headers**: `Content-Type: application/json`
- **Request Payload**:
```json
{
  "email": "tariq.electrician@example.pk",
  "password": "StrongPassword123!",
  "displayName": "Muhammad Tariq",
  "phone": "+923009876543",
  "gender": "MALE",
  "experienceMonths": 48,
  "hourlyRate": 600,
  "dailyRate": 3500,
  "preferredEngagementType": "DAILY",
  "bio": "Senior industrial electrician and wiring technician"
}
```
- **Validation Rules**:
  - `email`: Valid email format, lowercase normalized, unique.
  - `password`: Strong password policy (min 8 chars, uppercase, lowercase, number, symbol).
  - `displayName`: String, 2-100 characters.
  - `gender`: Optional Enum (`MALE`, `FEMALE`, `OTHER`, `PREFER_NOT_TO_SAY`).
  - `experienceMonths`: Non-negative integer.
  - `preferredEngagementType`: Enum (`HOURLY`, `DAILY`, `MONTHLY`, `TASK_BASED`).
- **Response (201 Created)**:
```json
{
  "user": {
    "id": "190cfe59-e290-486a-bba8-12f8cdb2e417",
    "email": "tariq.electrician@example.pk",
    "roles": ["WORKER"],
    "status": "ACTIVE",
    "createdAt": "2026-11-16T18:34:10.000Z",
    "workerProfile": {
      "id": "3e2c8f51-13f8-4513-a9bb-g40c70c5f961",
      "fullName": "Muhammad Tariq",
      "gender": "MALE",
      "experienceMonths": 48,
      "hourlyRate": 600,
      "dailyRate": 3500,
      "preferredEngagementType": "DAILY",
      "isAvailable": true,
      "verificationTier": "TIER_0_UNVERIFIED"
    }
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "b3e945c71a394f71...",
  "tokenType": "Bearer",
  "expiresIn": 900
}
```

### 1.3 User Login
- **Endpoint**: `POST /auth/login`
- **Access**: Public
- **Rate Limit**: 5 requests / 60 seconds (brute force mitigation)
- **Request Payload**:
```json
{
  "email": "apex.builder@example.pk",
  "password": "StrongPassword123!"
}
```
- **Response (200 OK)**:
```json
{
  "user": {
    "id": "a91c0b09-6d2d-4ae1-8087-d916badd70ea",
    "email": "apex.builder@example.pk",
    "roles": ["EMPLOYER"],
    "status": "ACTIVE"
  },
  "accessToken": "eyJhbGciOiJIUzI1Ni...",
  "refreshToken": "9d8a7c6b5e4f...",
  "tokenType": "Bearer",
  "expiresIn": 900
}
```
- **Error Responses**:
  - `401 Unauthorized`: `{"statusCode": 401, "message": "Invalid email or password", "error": "Unauthorized"}` (generic message prevents account enumeration).
  - `401 Unauthorized`: `{"statusCode": 401, "message": "Account is suspended. Access denied."}` (for deactivated, suspended, or banned accounts).

### 1.4 Refresh Access Token (Token Rotation)
- **Endpoint**: `POST /auth/refresh`
- **Access**: Public (requires raw refresh token in body)
- **Security**: Single-use token rotation. If an already revoked token is used, reuse detection automatically invalidates **all** active sessions for that user account.
- **Request Payload**:
```json
{
  "refreshToken": "9d8a7c6b5e4f..."
}
```
- **Response (200 OK)**:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1Ni...",
  "refreshToken": "1a2b3c4d5e6f...",
  "tokenType": "Bearer",
  "expiresIn": 900
}
```
- **Error Response (401 Unauthorized)**:
```json
{
  "statusCode": 401,
  "message": "Invalid or expired refresh token",
  "error": "Unauthorized"
}
```

### 1.5 Logout & Session Revocation
- **Endpoint**: `POST /auth/logout`
- **Access**: Public / Authenticated
- **Request Payload**:
```json
{
  "refreshToken": "1a2b3c4d5e6f..."
}
```
- **Response (200 OK)**:
```json
{
  "message": "Logged out successfully"
}
```

### 1.6 Forgot Password
- **Endpoint**: `POST /auth/forgot-password`
- **Access**: Public
- **Rate Limit**: 3 requests / 60 seconds
- **Request Payload**:
```json
{
  "email": "tariq.electrician@example.pk"
}
```
- **Response (200 OK)**:
```json
{
  "message": "If an account with that email exists, password reset instructions have been sent."
}
```
*(Always returns 200 OK with identical response regardless of whether the email exists, preventing account enumeration).*

### 1.7 Reset Password
- **Endpoint**: `POST /auth/reset-password`
- **Access**: Public
- **Request Payload**:
```json
{
  "token": "4f9d2a1b7e6c5d4...",
  "newPassword": "NewStrongPassword999!"
}
```
- **Response (200 OK)**:
```json
{
  "message": "Password has been reset successfully. Please log in with your new password."
}
```
- **Security Actions Executed**:
  - Validates cryptographic SHA-256 token hash against `password_reset_tokens`.
  - Verifies token is not expired (15m window) and not already consumed.
  - Updates bcrypt hash for user email identity.
  - Marks token `consumedAt: new Date()`.
  - Immediately revokes all active refresh token sessions in `auth_sessions`.

### 1.8 Email Verification
- **Endpoint**: `POST /auth/verify-email`
- **Access**: Public
- **Request Payload**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```
- **Response (200 OK)**:
```json
{
  "message": "Email verified successfully"
}
```
- **Error Response (400 Bad Request)**:
```json
{
  "statusCode": 400,
  "message": "Invalid or expired email verification token",
  "error": "Bad Request"
}
```

### 1.9 Get Current User Profile (`/auth/me`)
- **Endpoint**: `GET /auth/me`
- **Access**: Authenticated (Requires `Authorization: Bearer <accessToken>`)
- **Security**: Strips all sensitive data (`passwordHash`, `tokenHash`, reset tokens).
- **Response (200 OK)**:
```json
{
  "id": "a91c0b09-6d2d-4ae1-8087-d916badd70ea",
  "status": "ACTIVE",
  "roles": ["EMPLOYER"],
  "email": "apex.builder@example.pk",
  "isEmailVerified": true,
  "createdAt": "2026-11-16T18:34:09.000Z",
  "employerProfile": {
    "id": "2d1b7e40-02e7-4402-98aa-f39b69b4e850",
    "companyName": "Apex Construction Pvt Ltd",
    "employerType": "CONTRACTOR",
    "contactPhone": "+923001234567",
    "isVerified": false
  },
  "workerProfile": null
}
```

### 1.10 Role-Protected Test Endpoints
- `GET /auth/employer/only`: Enforces `@Roles(UserRole.EMPLOYER, UserRole.ADMIN)`. Returns 403 Forbidden for Workers.
- `GET /auth/worker/only`: Enforces `@Roles(UserRole.WORKER, UserRole.ADMIN)`. Returns 403 Forbidden for Employers.
- `GET /auth/admin/only`: Enforces `@Roles(UserRole.ADMIN)`. Returns 403 Forbidden for non-admins.

---

## 2. Worker Profile Management (`/workers`)

Protected by `JwtAuthGuard` and `RolesGuard(@Roles('WORKER', 'ADMIN'))`. Horizontal privilege escalation is blocked via user-session ownership verification.

### 2.1 Get Current Worker Profile
- **Endpoint**: `GET /workers/profile/me`
- **Access**: Authenticated (`WORKER`, `ADMIN`)
- **Response (200 OK)**:
```json
{
  "profile": {
    "id": "ec9972ce-34c5-44f6-bf1a-f9ec26d1c82f",
    "userId": "3e2c8f51-13f8-4513-a9bb-g40c70c5f961",
    "displayName": "Tariq Mehmood",
    "headline": "Master Industrial & Residential Electrician",
    "bio": "Certified electrician with 10+ years experience in 3-phase wiring.",
    "gender": "MALE",
    "dateOfBirth": "1992-05-15T00:00:00.000Z",
    "profilePictureUrl": null,
    "experienceMonths": 48,
    "expectedWageHourlyMinor": 600,
    "expectedWageDailyMinor": 3500,
    "expectedWageMonthlyMinor": null,
    "preferredEngagementType": "DAILY",
    "verificationLevel": "UNVERIFIED",
    "profileVisibility": "PUBLIC",
    "isAvailable": true,
    "availabilityStatus": "AVAILABLE",
    "languages": ["ur-PK", "en-US", "pa-PK"],
    "portfolioItems": [
      {
        "id": "portfolio_1",
        "title": "Commercial Plaza 3-Phase DB Box Wiring",
        "description": "Installed 100A main circuit breaker with surge protection.",
        "completedDate": "2024-02-10"
      }
    ],
    "primaryCategory": {
      "id": "cat-uuid",
      "code": "ELECTRICIAN",
      "nameEn": "Electrician",
      "nameUr": "الیکٹریشن",
      "categoryType": "SKILLED_TRADE"
    },
    "skills": [
      {
        "skillId": "skill-uuid-1",
        "proficiencyLevel": 5,
        "experienceMonths": 48,
        "evidenceSource": "SELF_DECLARED",
        "skill": {
          "id": "skill-uuid-1",
          "code": "ELEC_WIRING",
          "nameEn": "Building & House Wiring",
          "nameUr": "گھریلو وائرنگ"
        }
      }
    ],
    "experiences": [
      {
        "id": "exp-uuid-1",
        "roleTitle": "Lead Electrical Technician",
        "employerName": "Descon Engineering",
        "city": "Lahore",
        "startedOn": "2020-01-01T00:00:00.000Z",
        "endedOn": "2023-12-31T00:00:00.000Z",
        "isCurrent": false,
        "description": "Supervised industrial wiring and switchgear installation."
      }
    ],
    "qualifications": [
      {
        "id": "qual-uuid-1",
        "title": "Level 3 National Vocational Certificate in Electrical Installation",
        "issuer": "NAVTTC Pakistan",
        "qualificationType": "VOCATIONAL_CERTIFICATE",
        "issuedOn": "2019-06-01T00:00:00.000Z"
      }
    ],
    "availability": [
      {
        "dayOfWeek": 1,
        "isAvailable": true,
        "engagementPreference": "DAILY"
      }
    ]
  },
  "address": {
    "id": "addr-uuid",
    "locality": "I-8/3",
    "city": "Islamabad",
    "province": "Islamabad Capital Territory",
    "latitude": 33.6687,
    "longitude": 73.0763,
    "isExactPrivate": true
  },
  "completion": {
    "percentage": 85,
    "isProfileComplete": true,
    "suggestions": [
      "Upload a clear profile photo to enhance transparency and recognition."
    ]
  }
}
```

### 2.2 Update Worker Profile
- **Endpoint**: `PATCH /workers/profile/me`
- **Access**: Authenticated (`WORKER`, `ADMIN`)
- **Request Payload**:
```json
{
  "headline": "Master Industrial & Residential Electrician",
  "bio": "Certified electrician with 10+ years hands-on experience in 3-phase wiring.",
  "gender": "MALE",
  "dateOfBirth": "1992-05-15",
  "expectedWageDailyMinor": 3500,
  "expectedWageHourlyMinor": 600,
  "preferredEngagementType": "DAILY",
  "languages": ["ur-PK", "en-US", "pa-PK"],
  "availabilityStatus": "AVAILABLE"
}
```

### 2.3 Manage Skills
- **Endpoint**: `PUT /workers/profile/me/skills`
- **Access**: Authenticated (`WORKER`, `ADMIN`)
- **Request Payload**:
```json
{
  "skills": [
    { "skillId": "skill-uuid-1", "proficiencyLevel": 5, "experienceMonths": 48 },
    { "skillId": "skill-uuid-2", "proficiencyLevel": 4, "experienceMonths": 36 }
  ]
}
```

### 2.4 Manage Experiences
- **Add**: `POST /workers/profile/me/experiences` (Payload: `{ roleTitle, employerName, city, startedOn, endedOn, isCurrent, description }`)
- **Update**: `PUT /workers/profile/me/experiences/:id`
- **Delete**: `DELETE /workers/profile/me/experiences/:id`

### 2.5 Manage Qualifications
- **Add**: `POST /workers/profile/me/qualifications` (Payload: `{ title, issuer, qualificationType, credentialUrl, issuedOn, expiresOn }`)
- **Update**: `PUT /workers/profile/me/qualifications/:id`
- **Delete**: `DELETE /workers/profile/me/qualifications/:id`

### 2.6 Manage Availability & Schedule
- **Endpoint**: `PUT /workers/profile/me/availability`
- **Payload**:
```json
{
  "availabilityStatus": "AVAILABLE",
  "isAvailable": true,
  "weeklySchedule": [
    { "dayOfWeek": 1, "isAvailable": true, "engagementPreference": "DAILY" },
    { "dayOfWeek": 2, "isAvailable": true, "engagementPreference": "DAILY" }
  ]
}
```

### 2.7 Manage Portfolio
- **Endpoint**: `PUT /workers/profile/me/portfolio`
- **Payload**:
```json
{
  "portfolioItems": [
    {
      "title": "5kW Solar Inverter Installation",
      "description": "Installed hybrid solar system with battery backup in F-10 Islamabad.",
      "completedDate": "2024-01-15"
    }
  ]
}
```

### 2.8 Set Worker Location (PostGIS)
- **Endpoint**: `PUT /workers/profile/me/address`
- **Payload**:
```json
{
  "streetAddress": "Street 14, House 22",
  "locality": "I-8/3",
  "city": "Islamabad",
  "province": "Islamabad Capital Territory",
  "latitude": 33.6687,
  "longitude": 73.0763,
  "isExactPrivate": true
}
```

### 2.9 Public Worker Profile (Sanitized)
- **Endpoint**: `GET /workers/public/:id`
- **Access**: Public
- **Security**: Strips email, phone number, and exact street address. Returns only city, locality, skills, work history, and persistent safety notice.

---

## 3. Employer Profile Management (`/employers`)

Protected by `JwtAuthGuard` and `RolesGuard(@Roles('EMPLOYER', 'ADMIN'))`.

### 3.1 Get Current Employer Profile
- **Endpoint**: `GET /employers/profile/me`
- **Access**: Authenticated (`EMPLOYER`, `ADMIN`)
- **Response (200 OK)**:
```json
{
  "profile": {
    "id": "emp-uuid",
    "userId": "user-uuid",
    "displayName": "Kashif Builders",
    "businessName": "Kashif Commercial Contracting Ltd",
    "employerType": "CONTRACTOR",
    "description": "Prime contractor executing commercial building projects in Islamabad.",
    "ntnTaxNumber": "7654321-0",
    "profilePictureUrl": null,
    "isVerified": false,
    "hiringPreferences": {
      "preferredEngagementTypes": ["DAILY", "PROJECT"],
      "minExperienceMonths": 24,
      "preferredLanguages": ["ur-PK", "en-US"]
    }
  },
  "stats": {
    "totalJobPostings": 5,
    "activeJobPostings": 2,
    "totalHires": 8
  },
  "address": {
    "locality": "Blue Area",
    "city": "Islamabad",
    "province": "Islamabad Capital Territory",
    "latitude": 33.7153,
    "longitude": 73.0645
  },
  "completion": {
    "percentage": 90,
    "isProfileComplete": true,
    "suggestions": []
  }
}
```

### 3.2 Update Employer Profile
- **Endpoint**: `PATCH /employers/profile/me`
- **Payload**: `{ displayName, businessName, employerType, description, ntnTaxNumber, profilePictureUrl }`

### 3.3 Manage Hiring Preferences
- **Endpoint**: `PUT /employers/profile/me/preferences`
- **Payload**: `{ preferredCategoryIds, preferredEngagementTypes, minExperienceMonths, preferredLanguages, budgetMaxMinor }`

### 3.4 Set Employer Location (PostGIS)
- **Endpoint**: `PUT /employers/profile/me/address`
- **Payload**: `{ locality, city, province, latitude, longitude, isExactPrivate }`

### 3.5 Public Employer Profile
- **Endpoint**: `GET /employers/public/:id`
- **Access**: Public
- **Security**: Masks NTN tax number and exact private address. Shows active job openings and verified badge.

---

## 4. Taxonomy & Categories (`/taxonomy`)

### 4.1 List All Categories
- **Endpoint**: `GET /taxonomy/categories`
- **Access**: Public
- **Response**: List of 12 categories (`DOMESTIC`, `SKILLED_TRADE`, `INDUSTRIAL`) with Urdu and English labels and associated skills.

### 4.2 List Skills
- **Endpoint**: `GET /taxonomy/skills?categoryId=:id`
- **Access**: Public
- **Response**: List of 47 trade skills with bilingual names (`nameEn`, `nameUr`).

---

## 5. Job Management & Explainable Matchmaking (`/jobs`)

### 3.1 Create Job Posting
- **Endpoint**: `POST /jobs`
- **Access**: Authenticated (`EMPLOYER`)
- **Request Payload**:
```json
{
  "title": "Need Experienced Cook for Family of 4",
  "titleUr": "4 افراد کی فیملی کیلئے تجربہ کار باورچی درکار ہے",
  "tradeCategory": "Cook",
  "employmentType": "DAILY",
  "budgetMinPkr": 25000,
  "budgetMaxPkr": 32000,
  "city": "Islamabad",
  "area": "F-7/2",
  "latitude": 33.7215,
  "longitude": 73.0563,
  "description": "Looking for clean, punctual cook specialized in Pakistani cuisine (Karahi, Biryani, Sabzi) and light continental breakfast.",
  "requiredSkills": ["Pakistani Cuisine", "Hygiene & Sanitation", "Punctuality"],
  "minExperienceYears": 3,
  "urgency": "NORMAL"
}
```

### 3.2 Get Explainable AI Matches for Job
- **Endpoint**: `GET /jobs/:jobId/matches`
- **Access**: Job Creator (`EMPLOYER`) or `ADMIN`
- **Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "jobId": "job-501",
    "recommendations": [
      {
        "workerId": "w-204",
        "fullName": "Rashida Bibi",
        "primaryTrade": "Cook",
        "city": "Islamabad",
        "area": "G-7",
        "compositeScore": 0.914,
        "scoreBreakdown": {
          "skillScore": 0.95,
          "proximityScore": 0.88,
          "experienceScore": 0.92,
          "wageScore": 0.90,
          "availabilityScore": 1.00
        },
        "matchedSkills": ["Pakistani Cuisine", "Hygiene & Sanitation"],
        "missingSkills": ["Baking"],
        "positiveReasons": [
          "Specializes in Desi family cuisine with 5+ years experience",
          "Located within 3.8 km of worksite (G-7 to F-7)",
          "Salary expectation (PKR 28,000/mo) falls comfortably within your PKR 25,000 - 32,000 budget",
          "Police Character Certificate verified with local ICT authorities"
        ],
        "missingReasons": [
          "No commercial food handling certification on record (Self-reported hygiene experience)"
        ],
        "evidenceConfidence": 0.85,
        "verificationTier": "POLICE_VERIFIED",
        "safetyNotice": "Verification confirms identity and submitted documents only. Verification does NOT guarantee personal safety."
      }
    ]
  }
}
```

---

## 4. Moderation, Complaints & Admin Queue (`/admin`)

### 4.1 Document Verification Review
- **Endpoint**: `PATCH /admin/verification/:documentId`
- **Access**: Authenticated (`ADMIN`)
- **Request Payload**:
```json
{
  "status": "APPROVED",
  "adminNotes": "NADRA CNIC verified against submitted image and citizen data."
}
```

### 4.2 Submit User Complaint
- **Endpoint**: `POST /complaints`
- **Access**: Authenticated (`EMPLOYER`, `WORKER`)
- **Request Payload**:
```json
{
  "reportedUserId": "user-902",
  "jobId": "job-501",
  "category": "NO_SHOW",
  "description": "Worker confirmed daily booking for Monday morning but did not arrive and phone was switched off."
}
```

---

## 5. Python Explainable AI Engine Internal Contract
- **Endpoint**: `POST /internal/xai/rank` (Private inter-service HTTP)
- **Producer**: NestJS API
- **Consumer**: Python FastAPI Service
- **Evaluation Criteria**: Returns candidates ranked with Precision@3 and NDCG@3 benchmark validation.
