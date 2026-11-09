# System Architecture & Topology

## 1. Multi-Tier Distributed Architecture

LabourLens implements a micro-modular topology separating edge devices, transactional business logic, high-throughput video intelligence, and executive analytics.

```mermaid
flowchart TB
    subgraph ClientLayer["Edge & Client Tier"]
        Mobile["Flutter Mobile Client<br/>(Workers & Field Supervisors)"]
        Web["Next.js 14 Web Portal<br/>(Admins & Safety Officers)"]
        Cameras["On-Site CCTV Cameras<br/>(RTSP / Video Streams)"]
    end

    subgraph IngressLayer["API Gateway & Reverse Proxy"]
        Nginx["Nginx Reverse Proxy (:80 / :443)<br/>SSL Termination, Rate Limiting & WebSockets"]
    end

    subgraph ServiceLayer["Application & Services Tier"]
        NestAPI["NestJS Core API (:4000)<br/>Auth, Business Logic, WebSockets, Prisma"]
        FastAPIVision["FastAPI Vision Service (:8000)<br/>YOLOv8 PPE & Zone Inference"]
        FastAPIMatch["FastAPI Matching Service (:8001)<br/>Ranker & Explainable AI (SHAP)"]
    end

    subgraph PersistenceLayer["Data & Caching Tier"]
        Postgres[("PostgreSQL 16 + PostGIS (:5432)<br/>Relational & Spatial Geofences")]
        Redis[("Redis 7 (:6379)<br/>Pub/Sub, Session Caching, Rate Limits")]
        MinIO[("MinIO / AWS S3 (:9000)<br/>Violation Snapshots & Media")]
    end

    Mobile -->|HTTPS / REST| Nginx
    Web -->|HTTPS & WSS| Nginx
    Cameras -->|RTSP Stream| FastAPIVision

    Nginx -->|Proxy HTTP/WS| NestAPI
    Nginx -->|Static Assets| Web

    NestAPI --> Postgres
    NestAPI --> Redis
    NestAPI --> MinIO

    NestAPI -->|HTTP / gRPC| FastAPIMatch
    FastAPIVision -->|Safety Violation Events| NestAPI
    FastAPIVision --> MinIO
```

---

## 2. Component Responsibilities

### 2.1 Next.js 14 Web Portal (`apps/web`)
- Server Components for high-performance rendering of sites, timesheets, and audit ledgers.
- Client components for interactive Mapbox geofence editing and WebRTC/HLS live video stream monitoring.
- Socket.io client integration for instant safety violation alerts.

### 2.2 Flutter Mobile App (`apps/mobile`)
- Offline-first attendance engine with local Hive storage.
- Anti-spoof GPS geofencing utilizing ray-casting algorithms.
- Native biometric authentication (`local_auth`) for passwordless worker clock-in.

### 2.3 NestJS Core API (`apps/api`)
- Domain-driven controllers, services, repositories, and DTO validation.
- Short-lived JWT access tokens and database-backed rotating refresh tokens.
- Socket.io gateway broadcasting real-time site events to connected clients.

### 2.4 AI Microservices (`services/ai`)
- **Vision Subsystem**: OpenCV/PyAV RTSP frame ingestion, YOLOv8 inference, ByteTrack multi-object tracking, and automated bounding-box rendering.
- **Matching Subsystem**: Tabular machine learning model ranking candidate workers against job requisitions with SHAP explainability feature attribution.
