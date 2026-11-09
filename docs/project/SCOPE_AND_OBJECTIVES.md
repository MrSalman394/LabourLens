# Project Scope & Objectives

## 1. Primary Objectives

The core objectives of the LabourLens project are:
1. **Eliminate Time-Theft & Proxy Attendance**: Deploy a tamper-resistant mobile attendance solution utilizing polygonal GPS geofencing, mock-provider detection, and device biometrics.
2. **Optimize Labor Matching & Allocation**: Implement an Explainable AI (XAI) recommendation model that pairs job demands with qualified workers based on trade skills, location proximity, safety track record, and verified credentials.
3. **Automate Workplace Safety Governance**: Leverage computer vision (YOLOv8) on site CCTV streams to automatically detect missing PPE and hazardous zone intrusions, generating real-time alerts.
4. **Provide Unified Command & Intelligence**: Create an executive web application giving project managers and safety officers real-time visibility into attendance, compliance indices, and workforce productivity.

---

## 2. In-Scope Work Packages

### WP-1: Mobile Edge Subsystem (Flutter)
- Native GPS integration with anti-spoofing heuristics.
- Offline-first transactional database caching (Hive/Isar) and FIFO synchronization.
- Worker check-in/out interfaces, daily task lists, and photo-enabled safety hazard reporting.
- Supervisor roll-call mode and emergency muster broadcast receiver.

### WP-2: Enterprise Core Backend (NestJS)
- Modular RESTful API and WebSocket event gateways.
- Multi-tenant organization and worksite boundary management with PostGIS.
- Role-Based Access Control (RBAC) and audit logging middleware.
- Timesheet calculation engine (overtime, late arrivals, shift bonuses).

### WP-3: AI Matching & Allocation Microservice (Python)
- Tabular ranker / recommendation engine for worker-job pairing.
- Explainable AI (XAI) layer utilizing SHAP (SHapley Additive exPlanations) to provide human-interpretable rationale for match scores.
- Candidate filtering based on hard constraints (mandatory OSHA certifications, distance ceilings).

### WP-4: AI Computer Vision & Safety Microservice (Python)
- Multi-stream RTSP frame ingestion and intelligent downsampling (5-10 FPS).
- Fine-tuned YOLOv8 deep learning model for multi-class PPE detection (helmets, vests, boots).
- ByteTrack / BoT-SORT multi-object tracker to throttle duplicate notifications.
- Automatic snapshot cropping, bounding-box overlay rendering, and cloud storage upload.

### WP-5: Executive Web Command Center (Next.js 14+)
- Responsive dashboard using React Server Components (RSC) and Tailwind CSS / shadcn/ui.
- Interactive map interface (Mapbox GL) for creating and editing worksite geofence polygons.
- Live CCTV video stream viewer with real-time detection bounding-box overlays.
- Safety incident triage console and automated OSHA compliance report generation.

---

## 3. Deliberate Out-of-Scope Items

To ensure academic delivery quality and maintain clear system boundaries, the following are explicitly out of scope:
- Direct banking/clearinghouse payment processing (the system exports payroll timesheets to standard formats: CSV, Excel, JSON).
- Proprietary camera hardware engineering (the platform integrates with industry-standard RTSP/ONVIF IP cameras).
- Continuous GPS tracking outside of authorized shift hours (to respect worker privacy and local labor regulations).
