# AI Agent & Developer Guidelines (`AGENTS.md`)

Welcome, Agent. This document provides canonical context, rules, and commands so you can navigate and write code for **LabourLens** effectively and safely.

---

## 1. Project Mental Model

LabourLens is an enterprise labor monitoring and industrial safety AI platform structured as a multi-stack monorepo:
- **`apps/web`**: Next.js 14+ (App Router, React Server Components, Tailwind CSS, shadcn/ui, TanStack Query).
- **`apps/mobile`**: Flutter 3.x (Dart 3.x, flutter_bloc, Hive local DB, Geolocator).
- **`apps/api`**: NestJS (TypeScript, Prisma ORM, PostgreSQL, Redis, Socket.io, JWT + Argon2id).
- **`services/ai`**: Python 3.11+ (FastAPI, PyTorch, YOLOv8, ByteTrack, OpenCV, CUDA).
- **`database`**: PostgreSQL with PostGIS, SQL migrations, seed fixtures.
- **`infrastructure`**: Docker Compose, Nginx, MinIO, environment configs.
- **`docs`**: Complete specifications, architecture diagrams, and FYP documentation.

---

## 2. Directory Navigation Cheat Sheet

| Intent | Target Directory | Primary Files to Inspect |
|---|---|---|
| Web UI / Pages / Components | `apps/web/src/app` | `(dashboard)/*`, `components/ui/*` |
| Mobile Screens & Blocs | `apps/mobile/lib` | `screens/*`, `blocs/*`, `repositories/*` |
| Backend API & Logic | `apps/api/src` | `modules/*`, `guards/*`, `main.ts` |
| AI / ML Models & Vision | `services/ai/app` | `pipeline/*`, `models/*`, `api/*` |
| DB Schemas & Migrations | `database/` & `apps/api/prisma` | `schema.prisma`, `migrations/*` |
| Docker & Deployment | `infrastructure/` | `docker-compose.yml`, `nginx.conf` |
| Technical Specs & Specs | `docs/` | `ARCHITECTURE.md`, `API_SPECIFICATION.md` |

---

## 3. Technology Conventions & Coding Rules

### 3.1 TypeScript / NestJS (`apps/api`)
- **Strict Typing**: Always use TypeScript interfaces / DTOs with `class-validator` and `class-transformer` decorators. Avoid `any`.
- **Dependency Injection**: Always inject repositories and services via constructor injection.
- **Exceptions**: Use standard NestJS `HttpException` subclasses (`NotFoundException`, `UnauthorizedException`, `BadRequestException`).
- **Prisma**: Keep schema changes inside `apps/api/prisma/schema.prisma` or `database/schema.prisma`.

### 3.2 TypeScript / Next.js (`apps/web`)
- **App Router**: Colocate page-specific components inside their feature routes.
- **Server vs Client**: Use Server Components by default; only add `"use client"` when using hooks, browser APIs, or event listeners.
- **Styling**: Use utility Tailwind CSS classes and compose with `cn()` utility (`clsx` + `tailwind-merge`).

### 3.3 Flutter / Dart (`apps/mobile`)
- **State Management**: Use `BlocProvider` and `BlocBuilder` / `BlocConsumer`. Keep UI widgets dumb and stateless where possible.
- **Models**: Use `freezed` or `json_serializable` for immutable models and JSON serialization.
- **Async Handling**: Handle network and location errors gracefully; never assume GPS or internet is active.

### 3.4 Python / AI Service (`services/ai`)
- **Type Hints**: Use PEP 484 type annotations for all function signatures.
- **FastAPI**: Use Pydantic `BaseModel` for all request and response schemas.
- **Async Processing**: Do not block the async event loop with heavy image decoding; run synchronous computer vision inference inside threadpools (`run_in_executor`) or background workers.

---

## 4. Common Terminal Commands

### Run Everything via Docker
```bash
docker compose -f infrastructure/docker-compose.yml up --build
```

### Web App (`apps/web`)
```bash
cd apps/web
npm install
npm run dev       # Starts dev server on http://localhost:3000
npm run build     # Production build
npm run lint      # Run ESLint
```

### Backend API (`apps/api`)
```bash
cd apps/api
npm install
npx prisma generate
npm run start:dev  # Starts dev server on http://localhost:4000
npm run test       # Run unit tests
```

### Mobile App (`apps/mobile`)
```bash
cd apps/mobile
flutter pub get
flutter run        # Runs on connected device / emulator
flutter test       # Run unit tests
```

### AI Service (`services/ai`)
```bash
cd services/ai
python -m venv .venv
# On Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

---

## 5. Golden Rules for Agents

1. **Do Not Overwrite Configurations Silently**: Never delete existing environment keys or replace `.gitignore` rules without checking.
2. **Preserve Documentation Integrity**: Update `docs/` whenever introducing new endpoints, models, or environment variables.
3. **Respect Security Boundaries**: Never commit plaintext API keys, passwords, or production secrets to Git.
