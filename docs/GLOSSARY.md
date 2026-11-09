# Glossary & Terminology

This document defines core terminology, acronyms, and industrial concepts used throughout LabourLens.

---

## 1. Safety & Industrial Terms

| Term / Acronym | Definition | Context in LabourLens |
|---|---|---|
| **PPE** | Personal Protective Equipment | Safety gear mandated on industrial sites (Hard Hats, High-Visibility Vests, Steel-toe Boots, Safety Glasses, Gloves). |
| **OSHA** | Occupational Safety and Health Administration | Regulatory authority setting safety standards; LabourLens generates compliance reports conforming to OSHA guidelines. |
| **Red Zone** | High-Hazard Restricted Zone | A physically demarcated area (e.g. crane swing radius, high-voltage area) where unauthorized worker presence triggers an immediate critical alert. |
| **Near-Miss** | Unplanned event that did not result in injury but had potential to | Flagged automatically by AI when workers are in close proximity to moving machinery or drop hazards without proper safety equipment. |
| **Roll Call** | Verification of all workers currently on site | Real-time digital muster list generated automatically from active attendance logs for emergency evacuations. |

---

## 2. Artificial Intelligence & Computer Vision

| Term / Acronym | Definition | Context in LabourLens |
|---|---|---|
| **YOLO** | You Only Look Once | Real-time object detection model family (YOLOv8) used to detect workers and verify PPE gear compliance in video frames. |
| **Bounding Box** | Rectangular coordinate box $[x, y, w, h]$ | Coordinates output by YOLO enclosing detected workers, helmets, or vests. |
| **IoU** | Intersection over Union | Geometric overlap metric used to associate a detected helmet or vest with the corresponding worker body bounding box. |
| **mAP** | Mean Average Precision | Standard benchmark metric measuring detection accuracy across classes. |
| **ByteTrack / BoT-SORT** | Multi-Object Tracking algorithms | Keeps track of unique individual IDs across continuous video frames to eliminate duplicate violation alerts. |
| **FPS** | Frames Per Second | Rate of video frame ingestion and inference (LabourLens samples streams at 5-10 FPS for optimal efficiency). |
| **TensorRT / ONNX** | High-performance inference runtimes | Optimizes neural network weights for low-latency GPU execution. |

---

## 3. Geospatial & Mobile Technologies

| Term / Acronym | Definition | Context in LabourLens |
|---|---|---|
| **Geofence** | Virtual geographic perimeter | Defined by a polygon or circular boundary around a physical worksite; prevents workers from clocking in outside the site. |
| **PostGIS** | Spatial database extender for PostgreSQL | Powers sub-millisecond point-in-polygon queries (`ST_Contains`) on the backend. |
| **Mock Location** | Artificially generated GPS coordinates | Prevented via anti-spoofing checks in the mobile client (`isFromMockProvider`). |
| **BLoC** | Business Logic Component | Flutter state management architectural pattern separating presentation from business logic via event streams. |
| **Offline-First** | Architecture prioritizing local storage | Saves mobile check-ins and hazard reports locally in Hive when cell reception is dead, auto-syncing when reconnected. |

---

## 4. Software Engineering & Infrastructure

| Term / Acronym | Definition | Context in LabourLens |
|---|---|---|
| **RTSP** | Real-Time Streaming Protocol | Network protocol used by IP and CCTV cameras to stream video feeds into the AI inference service. |
| **RBAC** | Role-Based Access Control | Permission system restricting access to endpoints based on user roles (`ADMIN`, `SUPERVISOR`, `SAFETY_OFFICER`, `WORKER`). |
| **JWT** | JSON Web Token | Stateless cryptographic token standard used for authenticating API requests. |
| **Argon2id** | Memory-hard password hashing algorithm | Winner of the Password Hashing Competition; used to secure user credentials against GPU cracking. |
| **MinIO** | S3-compatible high-performance object storage | Self-hosted storage server used for local development to store incident snapshot images and video clips. |
