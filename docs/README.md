# LabourLens Documentation Hub

Comprehensive engineering and architectural specifications for **LabourLens**.

---

## Master Directory Map

### 1. Root Specifications
- [**AGENTS.md**](../AGENTS.md): Essential guide for AI coding agents (conventions, commands, invariants).
- [**PROJECT_CONTEXT.md**](../PROJECT_CONTEXT.md): Background, problem statement, stakeholders, and boundaries.
- [**PROJECT_OVERVIEW.md**](../PROJECT_OVERVIEW.md): Executive overview, value propositions, and key metrics.
- [**REQUIREMENTS.md**](../REQUIREMENTS.md): Functional and non-functional requirements matrix.

### 2. Project Foundations (`docs/project/`)
- [**SCOPE_AND_OBJECTIVES.md**](./project/SCOPE_AND_OBJECTIVES.md): Project goals, in-scope work packages, and constraints.
- [**FEATURES.md**](./project/FEATURES.md): Detailed catalog of all platform features.
- [**BUSINESS_LOGIC.md**](./project/BUSINESS_LOGIC.md): Domain rules, attendance validation, shift states, and penalty algorithms.

### 3. Architecture & Infrastructure (`docs/architecture/`)
- [**ARCHITECTURE.md**](./architecture/ARCHITECTURE.md): Multi-tier distributed architecture and component breakdown.
- [**SYSTEM_DESIGN.md**](./architecture/SYSTEM_DESIGN.md): Design patterns, WebSocket flows, and concurrency tactics.
- [**TECH_STACK.md**](./architecture/TECH_STACK.md): Full technology matrix (Next.js, Flutter, NestJS, Python, PostGIS).
- [**DATABASE_SCHEMA.md**](./architecture/DATABASE_SCHEMA.md): Entity-Relationship diagram, tables, and PostGIS indexes.
- [**API_DOCUMENTATION.md**](./architecture/API_DOCUMENTATION.md): REST endpoints and real-time WebSocket contracts.
- [**INTEGRATION_GUIDE.md**](./architecture/INTEGRATION_GUIDE.md): Camera RTSP streams, S3/MinIO, and FCM integration.

### 4. Artificial Intelligence & Vision (`docs/ai/`)
- [**AI_MATCHING.md**](./ai/AI_MATCHING.md): Problem formulation, candidate pool ranking, and input features.
- [**AI_MODEL_DOCUMENTATION.md**](./ai/AI_MODEL_DOCUMENTATION.md): YOLOv8 PPE detection and XGBoost ranker specs.
- [**EXPLAINABLE_AI.md**](./ai/EXPLAINABLE_AI.md): SHAP feature attribution and visual bounding-box evidence.
- [**MATCHING_ALGORITHM.md**](./ai/MATCHING_ALGORITHM.md): Multi-objective scoring math, sub-scores, and complexity.
- [**DATA_PROCESSING.md**](./ai/DATA_PROCESSING.md): Dataset sources, annotations, augmentations, and features.
- [**AI_EVALUATION.md**](./ai/AI_EVALUATION.md): Precision, recall, mAP@0.5, NDCG, and latency benchmarks.

### 5. Features & Roles (`docs/features/`)
- [**USER_ROLES.md**](./features/USER_ROLES.md): RBAC matrix (Admin, Supervisor, Safety Officer, Worker).
- [**JOB_MANAGEMENT.md**](./features/JOB_MANAGEMENT.md): Job requisitions, shift lifecycles, and dispatching.
- [**WORKER_MANAGEMENT.md**](./features/WORKER_MANAGEMENT.md): Worker profiles, trade taxonomy, and certifications.
- [**TRUST_AND_VERIFICATION.md**](./features/TRUST_AND_VERIFICATION.md): Anti-spoofing, mock-location traps, and biometric defense.

### 6. Design & User Experience (`docs/design/`)
- [**UI_UX_GUIDELINES.md**](./design/UI_UX_GUIDELINES.md): Industrial design philosophy, contrast, and haptic feedback.
- [**DESIGN_SYSTEM.md**](./design/DESIGN_SYSTEM.md): Tailwind / shadcn/ui components and Material 3 theme.
- [**RESPONSIVE_DESIGN.md**](./design/RESPONSIVE_DESIGN.md): Breakpoints, mobile-to-video-wall adaptability.

### 7. Security & Privacy (`docs/security/`)
- [**SECURITY.md**](./security/SECURITY.md): Defense in depth, Argon2id, JWT token families, and rate limits.
- [**PRIVACY_POLICY_REQUIREMENTS.md**](./security/PRIVACY_POLICY_REQUIREMENTS.md): GDPR compliance, facial blurring, and data minimization.

### 8. Development & Operations (`docs/development/`)
- [**CODING_STANDARDS.md**](./development/CODING_STANDARDS.md): Conventions for TypeScript, Next.js, Flutter, Python.
- [**DEVELOPMENT_ROADMAP.md**](./development/DEVELOPMENT_ROADMAP.md): Sprint plans, Gantt chart, and deliverables.
- [**TASK_TRACKER.md**](./development/TASK_TRACKER.md): Engineering task board and priority tracking.
- [**TESTING_STRATEGY.md**](./development/TESTING_STRATEGY.md): Unit, integration, and E2E testing pyramid.
- [**DEPLOYMENT_GUIDE.md**](./development/DEPLOYMENT_GUIDE.md): Local development quickstart and production Docker instructions.
- [**CHANGELOG.md**](./development/CHANGELOG.md): Version history and notable changes.
- [**KNOWN_ISSUES.md**](./development/KNOWN_ISSUES.md): Constraints, edge cases, and workarounds.
- [**DECISIONS.md**](./development/DECISIONS.md): Architecture Decision Records (ADRs).
- [**ENVIRONMENT_SETUP.md**](./development/ENVIRONMENT_SETUP.md): Toolchain prerequisites and environment variables.
- [**AGENT_HANDOVER.md**](./development/AGENT_HANDOVER.md): Quick orientation manual for incoming AI agents.
