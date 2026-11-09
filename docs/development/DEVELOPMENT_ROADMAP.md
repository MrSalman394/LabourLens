# Development Roadmap & Sprint Plan

## 1. Roadmap Milestones

```mermaid
gantt
    title LabourLens Engineering Sprints
    dateFormat  YYYY-MM-DD
    section Sprint 1: Setup & Contracts
    Monorepo & Docs Setup       :done,    s1_1, 2026-11-01, 2026-11-10
    Docker Stack & DB Migrations :active,  s1_2, 2026-11-10, 2026-11-20
    section Sprint 2: Core Auth & Sites
    NestJS JWT & PostGIS Sites   :         s2_1, 2026-11-20, 2026-12-05
    Next.js Geofence Editor      :         s2_2, 2026-11-28, 2026-12-15
    section Sprint 3: Mobile Field App
    Flutter BLoC & GPS Geofence  :         s3_1, 2026-12-15, 2027-01-05
    Offline Hive Sync Engine     :         s3_2, 2027-01-05, 2027-01-20
    section Sprint 4: AI Engines
    YOLOv8 PPE Stream Ingestion  :         s4_1, 2027-01-20, 2027-02-15
    AI Matching & SHAP Explanations:      s4_2, 2027-02-10, 2027-02-28
    section Sprint 5: Web CCTV & Integration
    Live CCTV Grid & Overlays    :         s5_1, 2027-03-01, 2027-03-20
    OSHA Reporting & Timesheets  :         s5_2, 2027-03-20, 2027-04-05
    section Sprint 6: Final Defense
    E2E Stress Testing & Demo    :         s6_1, 2027-04-05, 2027-04-25
```

---

## 2. Sprint Deliverables

- **Sprint 1 (Weeks 1-2)**: Monorepo scaffolding, database schemas, Docker Compose environment, comprehensive documentation.
- **Sprint 2 (Weeks 3-5)**: NestJS Core API authentication, user management, worksites, and PostGIS geofence CRUD.
- **Sprint 3 (Weeks 6-9)**: Flutter mobile app, GPS geofencing, mock location traps, and offline sync engine.
- **Sprint 4 (Weeks 10-14)**: Python AI microservices for YOLOv8 PPE detection and XGBoost job-worker matching.
- **Sprint 5 (Weeks 15-18)**: Next.js executive portal, live camera stream overlays, and real-time WebSocket alert feed.
- **Sprint 6 (Weeks 19-22)**: Stress testing, security hardening, final project defense presentation, and dissertation.
