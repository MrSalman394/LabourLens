# System Requirements Specification (SRS)

## 1. Project Objectives
LabourLens addresses challenges in modern labor-intensive industries (construction, manufacturing, logistics, and mining):
1. Automating manual and error-prone attendance through biometric and GPS-geofenced verification.
2. Mitigating industrial accidents through automated Personal Protective Equipment (PPE) detection and hazardous zone intrusion monitoring.
3. Providing actionable workforce productivity analytics without violating ethical labor guidelines or worker dignity.

---

## 2. User Personas

| Persona | Role | Primary Goals & Capabilities |
|---|---|---|
| **Field Worker** | End User | Clock-in/out on mobile within designated sites; view assigned daily tasks; submit safety hazard reports; view emergency SOS broadcasts. |
| **Site Supervisor** | Field Manager | Monitor real-time site presence; approve manual attendance overrides; review on-site PPE compliance alerts; broadcast alerts to crews. |
| **Safety Officer** | Compliance Manager | Live CCTV stream monitoring with bounding-box annotations; review and export safety audit reports; configure zone hazard thresholds. |
| **Project Manager** | Executive / Operations | Monitor labor allocation, site-by-site productivity scores, overtime costs, project milestone completion against labor hours. |
| **System Administrator** | IT / SysAdmin | Manage roles, tenant organizations, camera stream RTSP endpoints, geofence polygons, and system health telemetry. |

---

## 3. Functional Requirements (FR)

### 3.1 Authentication & Authorization
- **FR-AUTH-01**: The system must provide multi-role authentication (Admin, Safety Officer, Supervisor, Worker) via JWT with refresh tokens.
- **FR-AUTH-02**: Field workers must be able to authenticate using passwordless biometrics (Face ID / Fingerprint on mobile device) or an assigned Worker ID with OTP.
- **FR-AUTH-03**: All administrative actions must be logged in an immutable audit ledger (`audit_logs`).

### 3.2 Geofencing & Attendance Tracking
- **FR-ATT-01**: Supervisors must be able to draw polygonal or circular geofences around site coordinates on a map UI.
- **FR-ATT-02**: The mobile app must verify GPS location against active geofence boundaries prior to allowing clock-in or clock-out.
- **FR-ATT-03**: The mobile client must implement mock-location detection to prevent GPS spoofing.
- **FR-ATT-04**: Offline attendance events must be stored securely with cryptographic timestamps and synced when connectivity is restored.

### 3.3 Computer Vision & Safety Compliance
- **FR-CV-01**: The AI service must detect required PPE gear (Hard Hat, High-Vis Vest, Safety Gloves, Steel-toe Boots) from video streams.
- **FR-CV-02**: The system must flag unauthorized entry into designated "Red Zones" (crane operating areas, high-voltage rooms, excavation pits).
- **FR-CV-03**: When a violation occurs, the system must capture a high-resolution snapshot, log bounding-box coordinates, and generate a real-time alert within 3 seconds.
- **FR-CV-04**: The system must support fall detection and inactivity alerts to assist in emergency response.

### 3.4 Analytics & Reporting
- **FR-ANA-01**: Web dashboard must aggregate daily, weekly, and monthly attendance vs. scheduled hours.
- **FR-ANA-02**: Safety compliance scoring must calculate a daily safety index per worksite based on violation frequency and resolution times.
- **FR-ANA-03**: Automated export of OSHA/regulatory safety compliance reports in PDF and Excel formats.

---

## 4. Non-Functional Requirements (NFR)

### 4.1 Performance & Latency
- **NFR-PERF-01**: REST API response times for standard queries must remain under 200 ms at the 95th percentile (p95).
- **NFR-PERF-02**: Real-time safety alert notification delivery to web/mobile clients must occur within 2.5 seconds of frame ingestion.
- **NFR-PERF-03**: AI inference engine must achieve minimum 15 frames per second (FPS) per camera stream on supported edge hardware (NVIDIA Jetson / T4).

### 4.2 Security & Data Privacy
- **NFR-SEC-01**: All data in transit must be encrypted using TLS 1.3.
- **NFR-SEC-02**: All sensitive data at rest (biometric vectors, employee PII) must be encrypted using AES-256.
- **NFR-SEC-03**: The system must support face anonymization/blurring options in archived video footage to comply with data protection regulations (GDPR / local privacy statutes).

### 4.3 Availability & Fault Tolerance
- **NFR-AVAIL-01**: The core backend API must guarantee 99.9% uptime during operational work hours.
- **NFR-AVAIL-02**: Network interruptions must not result in data loss for mobile field clock-in events (offline queue buffer up to 72 hours).

### 4.4 Usability & Accessibility
- **NFR-UI-01**: Mobile application UI must feature high-contrast, large-button design accessible in harsh outdoor sunlight conditions.
- **NFR-UI-02**: The web portal must be fully responsive across desktop and tablet viewport resolutions (1024px to 4K).

