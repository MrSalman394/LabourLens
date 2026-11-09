# Worker Management & Profile Architecture

## 1. Overview

The **Worker Management Module** governs worker profiles, trade skill taxonomies, verified credentials, safety compliance history, and daily attendance logs.

---

## 2. Worker Profile Data Model

Each worker entity (`worker_profiles`) encapsulates:

```json
{
  "userId": "usr_882190aa",
  "workerCode": "LL-WRK-2026-0421",
  "personalInfo": {
    "firstName": "Hamza",
    "lastName": "Tariq",
    "phone": "+92-300-1234567",
    "emergencyContact": "+92-321-7654321",
    "avatarUrl": "https://storage.labourlens.io/avatars/usr_882190aa.jpg"
  },
  "tradeSpecialties": [
    { "trade": "STRUCTURAL_STEEL_FITTER", "yearsExperience": 6, "proficiency": "SENIOR" },
    { "trade": "ARC_WELDER", "yearsExperience": 4, "proficiency": "INTERMEDIATE" }
  ],
  "certifications": [
    {
      "certificateCode": "OSHA-30-CONST",
      "issuer": "OSHA Training Institute",
      "issuedAt": "2024-03-15",
      "expiresAt": "2029-03-15",
      "verificationStatus": "VERIFIED",
      "documentUrl": "https://storage.labourlens.io/certs/cert_98123.pdf"
    }
  ],
  "metrics": {
    "reliabilityRating": 4.85,
    "onTimeRate": 0.94,
    "totalCompletedShifts": 214,
    "safetyScore": 96.5,
    "activeViolationsCount": 0
  },
  "currentStatus": "AVAILABLE"
}
```

---

## 3. Worker Onboarding & Credential Verification

1. **Self-Registration / Bulk CSV Import**: Workers register via the mobile app or are bulk-imported by HR.
2. **Document Upload**: Photos or PDFs of national ID, trade licenses, and safety certificates are submitted.
3. **Admin Verification Flow**: Admins inspect certificates in the web portal (`/workers/verification`) and set status to `VERIFIED` or `REJECTED`.
4. **Biometric Face Enrollment**: Worker captures a 3D selfie on their mobile device during initial setup. The facial feature vector is securely extracted and stored for attendance verification.

---

## 4. Performance & Safety Tracking

- **Dynamic Safety Score**: Begins at 100. Deductions are automatically applied for verified computer vision PPE infractions ($ -2$ for missing vest, $ -5$ for missing helmet, $ -15$ for Red Zone entry).
- **Incentive Thresholds**: Workers maintaining scores above 95 receive priority ranking in the AI matching algorithm for premium shifts and overtime opportunities.
