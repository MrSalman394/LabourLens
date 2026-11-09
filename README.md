# LabourLens

LabourLens is an intelligent labor analytics and monitoring platform developed as a Final Year Project (FYP).

## Project Structure

```text
LabourLens/
│
├── apps/
│   ├── web/              # Next.js web application
│   ├── mobile/           # Flutter mobile application
│   └── api/              # NestJS backend
│
├── services/
│   └── ai/               # Python AI/ML service
│
├── database/             # Database scripts, migrations, and schemas
├── docs/                 # FYP documentation and design specs
├── infrastructure/      # Docker, Kubernetes, and deployment configs
├── scripts/              # Automation and setup scripts
│
└── .git/                 # Git repository
```

## Tech Stack Overview

- **Web Frontend**: [Next.js](https://nextjs.org/) (React 18+, TypeScript, Tailwind CSS, shadcn/ui)
- **Mobile Frontend**: [Flutter](https://flutter.dev/) (Dart, BLoC pattern, Hive offline storage)
- **Backend API**: [NestJS](https://nestjs.com/) (Node.js, TypeScript, Prisma ORM, Socket.io)
- **AI/ML Service**: [Python](https://www.python.org/) (FastAPI, PyTorch, YOLOv8 PPE detection, ByteTrack)
- **Database & Cache**: PostgreSQL with PostGIS & Redis
- **Infrastructure**: Docker Compose & Nginx

## Documentation

Full architectural, API, and project specifications are available in the [`docs/`](./docs/README.md) directory:

- 🤖 [**AGENTS.md**](./AGENTS.md) - **Primary guide for AI Coding Agents** (mental model, rules, and CLI cheat sheet)
- 🏗️ [**Architecture**](./docs/ARCHITECTURE.md) - System topology, communication protocols, and sub-systems
- 📋 [**System Requirements (SRS)**](./docs/SYSTEM_REQUIREMENTS.md) - Functional & non-functional requirements
- 🔌 [**API Specification**](./docs/API_SPECIFICATION.md) - REST endpoints & WebSocket gateway contracts
- 🗄️ [**Database Design**](./docs/DATABASE_DESIGN.md) - Entity-Relationship diagram & PostgreSQL schemas
- 👁️ [**AI & Vision Pipeline**](./docs/AI_ML_PIPELINE.md) - YOLOv8 PPE detection, tracking, and video processing
- 📱 [**Mobile App Specification**](./docs/MOBILE_APP_SPEC.md) - Flutter architecture, geofencing, and offline sync
- 💻 [**Web App Specification**](./docs/WEB_APP_SPEC.md) - Next.js App Router, CCTV monitoring, and RBAC
- 🚢 [**Deployment & DevOps**](./docs/DEPLOYMENT_AND_DEVOPS.md) - Docker Compose, environment vars, and CI/CD
- 🔒 [**Security & Compliance**](./docs/SECURITY_AND_COMPLIANCE.md) - Worker privacy, face blurring, and OSHA compliance
- 🔄 [**Data Flow & Sequences**](./docs/DATA_FLOW.md) - End-to-end Mermaid sequence diagrams
- 🗺️ [**Project Roadmap**](./docs/PROJECT_ROADMAP.md) - FYP phases, milestones, and deliverables
- 📖 [**Glossary**](./docs/GLOSSARY.md) - Safety, AI, and geospatial terminology

