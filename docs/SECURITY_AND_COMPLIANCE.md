# Security, Privacy & Regulatory Compliance

## 1. Security Philosophy

LabourLens operates in an industrial environment where personal biometric data, location telemetry, and worker safety logs are processed. The system is designed with a **Privacy-by-Design** and **Zero-Trust** security architecture.

---

## 2. Worker Privacy & Ethical AI Guarantees

### 2.1 Anonymization & Face Blurring
- **Default Redaction**: In video recording archives and non-incident snapshots, worker faces are automatically blurred using edge-detected facial regions unless specifically tagged during an emergency safety incident.
- **Biometric Hash Protection**: Raw facial photos for mobile login are never stored in plain format. Only high-dimensional mathematical embedding vectors (128-d or 512-d FaceNet vectors) are stored, encrypted with AES-256. These vectors cannot be reconstructed back into original facial images.
- **No Invasiveness**: The AI service explicitly does **not** perform emotional sentiment analysis, keystroke tracking, or personal restroom/breakroom monitoring. Monitoring is restricted exclusively to active designated industrial work zones.

### 2.2 Regulatory Compliance
- **OSHA Compliance**: Automated generation of OSHA 300 logs for workplace injuries, near-misses, and safety compliance audits.
- **GDPR & Local Labor Laws**:
  - Right to Access: Workers can request and view all attendance records and safety logs tied to their identity.
  - Retention Policies: Video violation snapshots are retained for 90 days by default, after which automated cleanup scripts purge raw media.

---

## 3. Authentication & Credential Hygiene

### 3.1 Password & Token Security
- **Hashing**: Passwords are hashed using **Argon2id** (memory cost: 64MB, time cost: 3 iterations, parallelism: 1 thread).
- **Short-Lived Access Tokens**: JWT access tokens carry a 15-minute expiration window.
- **Rotating Refresh Tokens**: Refresh tokens are stored in the database as salted hashes and rotated upon every refresh request. Reuse of an old refresh token instantly invalidates all active sessions for that user account (Token Family Revocation).
- **Transport Layer**: Strict HTTPS enforcement with HTTP Strict Transport Security (HSTS) headers and TLS 1.3.

### 3.2 Role-Based Access Control (RBAC) Matrix

| Resource / Action | Field Worker | Site Supervisor | Safety Officer | Project Admin |
|---|:---:|:---:|:---:|:---:|
| Mobile Clock-In / Out | :white_check_mark: | :white_check_mark: | :x: | :x: |
| Submit Hazard Photo | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: |
| Manual Attendance Override | :x: | :white_check_mark: | :x: | :white_check_mark: |
| View Live CCTV Stream | :x: | :x: | :white_check_mark: | :white_check_mark: |
| Dismiss / Resolve Safety Alert | :x: | :white_check_mark: | :white_check_mark: | :white_check_mark: |
| Modify Geofence Polygons | :x: | :x: | :x: | :white_check_mark: |
| Manage User Roles & Accounts | :x: | :x: | :x: | :white_check_mark: |
| View Company-Wide Financials | :x: | :x: | :x: | :white_check_mark: |

---

## 4. Threat Modeling & Mitigation

| Threat | Attack Vector | Mitigation Strategy |
|---|---|---|
| **GPS Spoofing** | Worker uses fake GPS app to clock-in from home | Mobile app verifies `isFromMockProvider` flag, compares cell tower ID, and validates speed trajectory between pings. |
| **Replay Attacks** | Capturing and replaying mobile attendance API packets | API requires monotonically increasing nonce, client timestamps within $\pm 60$ seconds, and signed request payloads. |
| **Brute-Force Login** | Automated dictionary attacks on web/mobile login | Rate-limiting enforced via Redis sliding window (5 failed attempts per IP/account triggers a 15-minute lockout). |
| **RTSP Video Sniffing** | Intercepting unencrypted camera feeds across site Wi-Fi | Site cameras placed on segregated VLAN with RTSP over TLS (RTSPS) or VPN tunnel to edge gateway. |
