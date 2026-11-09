# REST & WebSocket API Documentation

## 1. General Principles

- **Base URL**: `https://api.labourlens.io/api/v1` (Dev: `http://localhost:4000/api/v1`)
- **Authentication**: HTTP Bearer JWT token in headers (`Authorization: Bearer <token>`).
- **Response Structure**:
```json
{
  "statusCode": 200,
  "data": {},
  "message": "Operation successful",
  "timestamp": "2026-11-09T16:30:00.000Z"
}
```

---

## 2. Core Endpoint Summary

### 2.1 Authentication (`/auth`)
| Method | Route | Access | Purpose |
|---|---|---|---|
| `POST` | `/auth/login` | Public | Authenticate user with email and password |
| `POST` | `/auth/refresh` | Public | Obtain new access token via rotating refresh token |
| `POST` | `/auth/logout` | Authenticated | Invalidate refresh token and blacklist session |

### 2.2 Worksites & Geofences (`/sites`)
| Method | Route | Access | Purpose |
|---|---|---|---|
| `GET` | `/sites` | Authenticated | List all active worksites for organization |
| `POST` | `/sites` | Admin / Supervisor | Create new site with polygon geofence geometry |
| `GET` | `/sites/:id/geofence` | Authenticated | Fetch active GeoJSON boundary polygon |
| `PUT` | `/sites/:id/geofence` | Admin | Update site boundary coordinates |

### 2.3 Attendance & Shifts (`/attendance`)
| Method | Route | Access | Purpose |
|---|---|---|---|
| `POST` | `/attendance/clock-in` | Worker | Submit GPS coordinates for geofence verification |
| `POST` | `/attendance/clock-out` | Worker | Conclude shift and log end timestamp |
| `POST` | `/attendance/sync-offline` | Worker | Batch sync offline-queued attendance records |
| `GET` | `/attendance/live-roster/:siteId` | Supervisor / Admin | Get live roll call of active workers on site |

### 2.4 AI Job Matching (`/matching`)
| Method | Route | Access | Purpose |
|---|---|---|---|
| `POST` | `/matching/recommend-candidates` | Supervisor / Admin | Run AI matching model for open job requisition |
| `GET` | `/matching/explain/:jobId/:workerId` | Supervisor / Admin | Fetch SHAP feature attribution & score breakdown |

### 2.5 Safety & Video Telemetry (`/safety`)
| Method | Route | Access | Purpose |
|---|---|---|---|
| `POST` | `/safety/detections` | AI Service (Service-to-Service) | Ingest real-time PPE violation and snapshot URL |
| `GET` | `/safety/incidents` | Safety Officer / Admin | Filter safety incidents by site, severity, date |
| `PATCH` | `/safety/incidents/:id/resolve` | Safety Officer | Mark incident as acknowledged or resolved |

---

## 3. Real-Time WebSockets (`/events`)

- **Namespace**: `/events`
- **Events Emitted by Server**:
  - `safety_violation_alert`: Broadcasts snapshot, severity, and camera ID when violation occurs.
  - `attendance_roster_change`: Broadcasts increments/decrements in active worker site count.
  - `emergency_broadcast`: High-priority alert notifying workers and supervisors to evacuate.
