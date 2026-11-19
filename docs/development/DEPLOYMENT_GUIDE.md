# Deployment & Operations Guide

## 1. Local Development Quickstart

### Prerequisites
- Docker & Docker Compose ($v24.0+$)
- Node.js ($v20.x+$ LTS)
- Flutter ($v3.22+$)
- Python ($v3.11+$)

### Steps to Run Full Stack
```bash
# 1. Clone repository
git clone https://github.com/your-org/LabourLens.git
cd LabourLens

# 2. Copy environment template
cp .env.example .env

# 3. Spin up infrastructure services (Postgres, Redis, MinIO)
docker compose -f infrastructure/docker-compose.yml up -d db redis minio

# 4. Start NestJS Backend API
cd apps/api
npm install
npx prisma migrate dev
npm run start:dev

# 5. Start Next.js Web Portal (new terminal)
cd apps/web
npm install
npm run dev

# 6. Start Python AI Microservice (new terminal)
cd services/ai
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

---

## 2. Production Docker Deployment

A complete production deployment orchestrates all microservices behind Nginx:

```bash
docker compose -f infrastructure/docker-compose.prod.yml up --build -d
```

### Resource Allocations (Recommended Production Node)
- **CPU**: 8 Cores (AMD EPYC / Intel Xeon)
- **RAM**: 32 GB
- **GPU**: 1x NVIDIA Tesla T4 / L4 (for multi-stream AI inference)
- **Disk**: 500 GB NVMe SSD

