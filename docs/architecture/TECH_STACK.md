# Technology Stack Specification

## 1. Complete Technology Matrix

| Layer | Component | Technology Selected | Version | Justification |
|---|---|---|---|---|
| **Web Frontend** | Core Framework | Next.js (App Router) | 14.x+ / 15.x | High-performance Server Components, SEO, and robust DX |
| | Language | TypeScript | 5.x | End-to-end type safety and compile-time error prevention |
| | Styling | Tailwind CSS & shadcn/ui | 3.4+ / Latest | Rapid, consistent enterprise design system |
| | Data Fetching | TanStack Query | v5 | Client-side cache invalidation, polling, and pagination |
| | Maps & Spatial | Mapbox GL JS / Leaflet | Latest | Fluid vector polygon geofence creation and editing |
| **Mobile App** | Core Framework | Flutter | 3.22+ | Single codebase targeting Android & iOS native performance |
| | Language | Dart | 3.4+ | Sound null-safety, fast execution, strong concurrency |
| | State Management | flutter_bloc | 8.1+ | Scalable, testable, predictable event-driven state |
| | Local Persistence | Hive | 2.2+ | Ultra-fast NoSQL key-value database for offline shift queueing |
| | Location | Geolocator | 12.0+ | Native high-accuracy GPS with mock location detection |
| **Backend API** | Core Framework | NestJS | 10.x / 11.x | Enterprise architectural discipline, decorators, DI container |
| | Language | TypeScript / Node.js | Node 20+ LTS | Uniform typing across web and backend |
| | ORM | Prisma ORM | 5.x / 6.x | Type-safe queries, automated migrations, PostGIS support |
| | Real-Time | Socket.io | 4.x | Bi-directional, low-latency alert broadcasts |
| | Password Hash | Argon2id (via argon2) | Latest | State-of-the-art memory-hard password encryption |
| **AI / ML Service** | Web Framework | FastAPI | 0.111+ | Asynchronous high-throughput Python API with OpenAPI schema |
| | Computer Vision | Ultralytics YOLOv8 | 8.2+ | State-of-the-art real-time object and PPE detection |
| | Object Tracking | ByteTrack / BoT-SORT | Latest | Multi-object tracking across continuous video frames |
| | ML / XAI | Scikit-learn & SHAP | Latest | Tabular candidate matching with Explainable AI feature plots |
| | Stream Ingestion | OpenCV / PyAV | 4.9+ | Low-latency RTSP and WebRTC video decoding |
| **Storage & Infra** | Primary DB | PostgreSQL with PostGIS | 16.x | Relational integrity + spatial geofence polygon calculations |
| | In-Memory Cache | Redis | 7.x Alpine | Pub/Sub messaging, session caching, and rate limiting |
| | Object Storage | MinIO / AWS S3 | Latest | High-capacity storage for incident snapshots and video clips |
| | Orchestration | Docker & Docker Compose | 26.x+ | Deterministic multi-container local and staging environments |
