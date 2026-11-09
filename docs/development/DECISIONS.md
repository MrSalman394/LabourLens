# Architecture Decision Records (ADRs)

## ADR-001: Selection of Monorepo Layout over Polyrepo
- **Status**: Accepted
- **Context**: The project spans web, mobile, backend API, AI microservices, and database schemas.
- **Decision**: Organize into a single root monorepo with `apps/`, `services/`, and `docs/`.
- **Consequences**: Unified version control, simplified CI/CD, shared documentation, and atomic commits across full-stack features.

---

## ADR-002: PostgreSQL + PostGIS over MongoDB Geospatial
- **Status**: Accepted
- **Context**: Need to store relational workforce and payroll entities alongside spatial geofences.
- **Decision**: Use PostgreSQL 16 with the PostGIS extension.
- **Consequences**: Superior relational ACID guarantees for payroll/shifts, native GiST spatial indexes for high-speed polygon containment queries (`ST_Contains`), eliminating the need for a separate spatial database.

---

## ADR-003: YOLOv8 for PPE Detection over Two-Stage Detectors (Faster R-CNN)
- **Status**: Accepted
- **Context**: Video processing requires real-time inference on multiple continuous camera streams.
- **Decision**: Deploy fine-tuned Ultralytics YOLOv8x.
- **Consequences**: Exceptional inference speeds ($< 10\text{ ms/frame}$ on TensorRT), high mAP ($> 0.90$), and direct export pathways to ONNX, TensorRT, and CoreML.

---

## ADR-004: Explainable AI via SHAP over Black-Box Deep Neural Net for Matching
- **Status**: Accepted
- **Context**: Labor assignment decisions can face legal disputes and discrimination scrutiny.
- **Decision**: Use a gradient-boosted ranker (XGBoost) paired with TreeSHAP feature attribution.
- **Consequences**: Clear, transparent, human-auditable score breakdowns for supervisors, proving that assignments are based strictly on trade skills, certifications, and proximity.

---

## ADR-005: On-Demand GPS Polling over Continuous Geotracking
- **Status**: Accepted
- **Context**: Balancing worker privacy and battery longevity against worksite accountability.
- **Decision**: Poll GPS exclusively during explicit shift transitions (Clock-In / Clock-Out) and safety hazards.
- **Consequences**: Eliminates invasive 24/7 worker surveillance, complies with strict labor regulations, and minimizes mobile battery consumption.
