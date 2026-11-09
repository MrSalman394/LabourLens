# Deployment, DevOps & Infrastructure

## 1. Overview

LabourLens is fully containerized using Docker and orchestrated using Docker Compose for local development and Kubernetes / ECS for production deployments.

```mermaid
flowchart TD
    Client["Client Request (Web / Mobile)"] --> Nginx["Nginx Reverse Proxy (:80 / :443)"]
    
    subgraph Services["Docker Compose Network"]
        Nginx -->|/api/*| API["NestJS API Container (:4000)"]
        Nginx -->|/*| Web["Next.js Web Container (:3000)"]
        Nginx -->|/socket.io| API
        
        API -->|Internal HTTP :8000| AI["FastAPI AI Service Container (:8000)"]
        API --> Postgres[("PostgreSQL DB (:5432)")]
        API --> Redis[("Redis Cache / PubSub (:6379)")]
        AI --> S3[("MinIO / AWS S3 Object Storage (:9000)")]
    end
```

---

## 2. Docker Compose Topology (`infrastructure/docker-compose.yml`)

The multi-container stack consists of the following managed services:

1. **`labourlens-web`**: Next.js Node.js Alpine runtime on port `3000`.
2. **`labourlens-api`**: NestJS Node.js Alpine runtime on port `4000`.
3. **`labourlens-ai`**: Python 3.11 with CUDA/PyTorch runtime on port `8000`.
4. **`labourlens-db`**: PostgreSQL 16 with PostGIS extension on port `5432`.
5. **`labourlens-redis`**: Redis 7 Alpine cache on port `6379`.
6. **`labourlens-minio`**: MinIO S3-compatible local object storage on port `9000` / `9001`.
7. **`labourlens-proxy`**: Nginx Alpine reverse proxy on port `80` / `443`.

---

## 3. Environment Variables Reference

A `.env.example` file is provided in the repository root. Critical environment keys include:

```ini
# --- Core Environment ---
NODE_ENV=development
APP_PORT=4000
WEB_PORT=3000
AI_PORT=8000

# --- Database & Cache ---
DATABASE_URL=postgresql://labourlens_admin:SecretPass123!@localhost:5432/labourlens_db?schema=public
REDIS_URL=redis://localhost:6379

# --- Authentication ---
JWT_ACCESS_SECRET=your_super_secret_access_key_min_32_chars
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your_super_secret_refresh_key_min_32_chars
JWT_REFRESH_EXPIRES_IN=7d

# --- Object Storage (S3 / MinIO) ---
S3_ENDPOINT=http://localhost:9000
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
S3_BUCKET_NAME=labourlens-media
S3_REGION=us-east-1

# --- AI Service Internal Connection ---
AI_SERVICE_URL=http://localhost:8000/api/v1
AI_INFERENCE_BATCH_SIZE=4
AI_CONFIDENCE_THRESHOLD=0.70
```

---

## 4. CI/CD Pipeline (GitHub Actions)

The continuous integration pipeline (`.github/workflows/ci.yml`) runs on every pull request to `main` and `develop`:

```mermaid
flowchart LR
    Lint["1. Lint & Format Check<br/>(ESLint, Prettier, Flake8)"] --> Test["2. Unit & Integration Tests<br/>(Jest, PyTest, Flutter Test)"]
    Test --> Build["3. Docker Multi-Stage Build<br/>(Cache layers & Security scan)"]
    Build --> Deploy["4. Automated Staging Deploy<br/>(AWS ECS / DigitalOcean K8s)"]
```

### Build & Test Matrix
- **`apps/web`**: `npm run lint`, `npm run build`, `npm run test`
- **`apps/api`**: `npm run lint`, `npm run test:e2e`
- **`apps/mobile`**: `flutter analyze`, `flutter test`
- **`services/ai`**: `black --check .`, `pytest -v tests/`

---

## 5. Health Checks & Monitoring

All services expose a standardized `/health` endpoint:
- **NestJS API**: `GET /api/v1/health` (Checks DB connectivity via Prisma, Redis ping, and S3 status).
- **FastAPI AI**: `GET /api/v1/health` (Checks model weights loaded in VRAM, GPU memory utilization).
- **Docker Compose Healthcheck**: Auto-restarts containers experiencing crashloops or unresponsive threadpools.
