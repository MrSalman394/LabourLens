# LabourLens - Master Requirements Specification

## 1. Functional Requirements Matrix

### 1.1 Authentication & Security (AUTH)
- **REQ-AUTH-01**: System must support Role-Based Access Control (RBAC) across four standard roles: `ADMIN`, `SUPERVISOR`, `SAFETY_OFFICER`, and `WORKER`.
- **REQ-AUTH-02**: Passwords must be hashed using the memory-hard `Argon2id` algorithm with salt.
- **REQ-AUTH-03**: Authentication tokens must follow JWT standards: access tokens with 15-minute validity, rotating refresh tokens with 7-day validity.
- **REQ-AUTH-04**: Mobile application must integrate device biometric authentication (Face ID / Fingerprint via `local_auth`).

### 1.2 Job & Worker Management (JWM)
- **REQ-JWM-01**: Supervisors must be able to create job requisitions specifying required trades, skill levels, safety certifications, start/end dates, and worksite.
- **REQ-JWM-02**: System must maintain verified worker profiles containing trade skills, licenses (e.g. OSHA-10, Heavy Equipment Operator), past attendance scores, and safety ratings.
- **REQ-JWM-03**: AI Matching Engine must evaluate worker pools and generate ranked candidate lists with matching scores ($0.0 - 1.0$) and human-readable explanations.

### 1.3 Attendance & Geofencing (ATT)
- **REQ-ATT-01**: Admins and Supervisors must be able to draw worksite geofences (circular and polygonal GeoJSON) on an interactive map.
- **REQ-ATT-02**: Mobile client must verify device GPS coordinates against the active site boundary prior to clock-in/out authorization.
- **REQ-ATT-03**: Mobile client must detect and block spoofed coordinates (`isMockLocation == true`).
- **REQ-ATT-04**: In low-connectivity environments, attendance logs must be encrypted and stored in local device storage (Hive), auto-syncing upon network restoration.

### 1.4 Computer Vision & Safety Compliance (SAFE)
- **REQ-SAFE-01**: AI Vision microservice must ingest RTSP video feeds from on-site IP cameras.
- **REQ-SAFE-02**: Model must detect missing Personal Protective Equipment (hard hat, high-vis vest, safety boots, gloves) with $\ge 88\%$ mAP@0.5.
- **REQ-SAFE-03**: Multi-object tracking (ByteTrack) must prevent spam alerts by maintaining unique tracking IDs and throttling repeat alerts for the same worker within 60 seconds.
- **REQ-SAFE-04**: System must capture an annotated snapshot of every violation and trigger a WebSocket event to the Safety Officer's web dashboard within 3 seconds.

---

## 2. Non-Functional Requirements (NFR)

### 2.1 Performance & Scalability
- **NFR-PERF-01**: REST API p95 response time must not exceed 200ms under standard operational load.
- **NFR-PERF-02**: Database queries must use spatial GiST indexes and B-tree compound indexes to maintain $< 50\text{ ms}$ execution time for site rosters.
- **NFR-PERF-03**: System must scale horizontally via stateless NestJS and FastAPI container replicas.

### 2.2 Security & Data Privacy
- **NFR-SEC-01**: All external and inter-service communications must be encrypted using TLS 1.3.
- **NFR-SEC-02**: Archived CCTV footage must apply automated facial blurring on non-incident workers to comply with privacy regulations (GDPR / ethical AI standards).
- **NFR-SEC-03**: All administrative mutations (attendance overrides, user role edits) must be written to an append-only audit log.

### 2.3 Usability & Reliability
- **NFR-REL-01**: Core API service must maintain 99.9% availability during scheduled operational hours.
- **NFR-UI-01**: Mobile application UI must feature high-contrast outdoor theme with large touch targets ($\ge 48\times 48\text{ px}$) operable with work gloves.

