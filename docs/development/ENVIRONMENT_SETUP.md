# Developer Environment Setup

## 1. System Requirements

- **OS**: Windows 10/11, macOS (Apple Silicon or Intel), or Ubuntu 22.04+ LTS.
- **Hardware**: Minimum 16GB RAM, 50GB free disk space. NVIDIA GPU with CUDA 12+ recommended for AI vision training and TensorRT inference.

---

## 2. Software Dependencies Installation

### 2.1 Node.js & Package Managers
Install Node.js $v20.x+$ LTS:
```bash
# Verify installation
node -v   # Expected: v20.x or v22.x
npm -v    # Expected: 10.x+
```

### 2.2 Flutter SDK
Install Flutter $v3.22+$:
```bash
flutter doctor
```

### 2.3 Python Environment
Install Python $v3.11+$:
```bash
python --version   # Expected: Python 3.11.x
```

### 2.4 Docker & Docker Compose
Install Docker Desktop or Docker Engine:
```bash
docker --version
docker compose version
```

---

## 3. Repository Configuration

1. Clone the repository and navigate into the root:
   ```bash
   cd LabourLens
   ```
2. Copy the root environment file:
   ```bash
   cp .env.example .env
   ```
3. Initialize the development database and caching containers:
   ```bash
   docker compose -f infrastructure/docker-compose.yml up -d db redis minio
   ```
4. Follow the specific setup instructions in each subfolder:
   - Web: `apps/web/README.md`
   - Mobile: `apps/mobile/README.md`
   - API: `apps/api/README.md`
   - AI: `services/ai/README.md`
