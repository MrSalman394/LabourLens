# AI Agent Handover & Quick Orientation

Welcome, incoming AI Agent (Antigravity, Cursor, Claude Code, GitHub Copilot). This document provides an immediate, zero-friction orientation so you can start contributing code without breaking architectural invariants.

---

## 1. Quick Invariants to Respect

1. **Monorepo Boundaries**:
   - Web frontend code belongs in `apps/web/src/`.
   - Backend API controllers and logic belong in `apps/api/src/`.
   - Flutter mobile screens and BLoCs belong in `apps/mobile/lib/`.
   - Python computer vision and matching services belong in `services/ai/app/`.
   - Shared cross-cutting code / models can reside in `src/`.
2. **Never Commit Secrets**: Do not write real API secrets, database passwords, or private keys to source files or markdown artifacts.
3. **Database Changes**: Always update Prisma schemas in `apps/api/prisma/schema.prisma` or `database/schema.prisma`. Do not manually alter database tables without a corresponding migration script.
4. **Preserve Documentation Integrity**: When you introduce new endpoints, environment variables, or data models, update the corresponding markdown document in `docs/`.

---

## 2. Fast Navigation Index

- **Understanding the Architecture**: Read [`docs/architecture/ARCHITECTURE.md`](../architecture/ARCHITECTURE.md) and [`docs/architecture/SYSTEM_DESIGN.md`](../architecture/SYSTEM_DESIGN.md).
- **Inspecting REST & WebSocket Contracts**: Read [`docs/architecture/API_DOCUMENTATION.md`](../architecture/API_DOCUMENTATION.md).
- **Understanding AI Models (Vision & Matching)**: Read [`docs/ai/AI_MODEL_DOCUMENTATION.md`](../ai/AI_MODEL_DOCUMENTATION.md) and [`docs/ai/EXPLAINABLE_AI.md`](../ai/EXPLAINABLE_AI.md).
- **Checking Active Tasks**: Inspect [`docs/development/TASK_TRACKER.md`](./TASK_TRACKER.md).
- **Coding Conventions**: Refer to [`docs/development/CODING_STANDARDS.md`](./CODING_STANDARDS.md) and root [`AGENTS.md`](../../AGENTS.md).

---

## 3. Recommended Development Flow

1. Check `docs/development/TASK_TRACKER.md` for the target task.
2. Formulate your plan and confirm invariants before modifying files.
3. Run tests using standard CLI commands specified in `AGENTS.md`.
4. Update `CHANGELOG.md` upon completing notable features.
