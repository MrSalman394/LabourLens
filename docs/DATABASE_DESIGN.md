# Database Schema & Data Models

## 1. Overview & Technology Choices

LabourLens employs **PostgreSQL** as the primary relational database system, accessed via **Prisma ORM** in the NestJS backend. PostgreSQL provides ACID compliance for workforce records, spatial indexing via PostGIS for polygon geofencing, and native JSONB columns for flexible AI detection metadata.

---

## 2. Entity-Relationship Diagram (ERD)

```mermaid
erDiagram
    ORGANIZATIONS ||--o{ SITES : operates
    SITES ||--o{ GEOFENCES : defines
    SITES ||--o{ CAMERAS : hosts
    SITES ||--o{ SHIFTS : schedules
    ORGANIZATIONS ||--o{ USERS : employs
    USERS ||--o{ ATTENDANCE_LOGS : records
    SHIFTS ||--o{ ATTENDANCE_LOGS : assigns
    CAMERAS ||--o{ SAFETY_INCIDENTS : captures
    SITES ||--o{ SAFETY_INCIDENTS : occurs_at
    USERS ||--o| WORKER_PROFILES : has
    USERS ||--o{ AUDIT_LOGS : triggers

    ORGANIZATIONS {
        uuid id PK
        string name
        string slug
        timestamp created_at
    }

    SITES {
        uuid id PK
        uuid organization_id FK
        string name
        string address
        float latitude
        float longitude
        string status
    }

    GEOFENCES {
        uuid id PK
        uuid site_id FK
        string name
        string polygon_coordinates "GeoJSON Polygon"
        float radius_meters
        boolean is_active
    }

    USERS {
        uuid id PK
        uuid organization_id FK
        string email
        string password_hash
        string first_name
        string last_name
        string role "ADMIN | SUPERVISOR | SAFETY_OFFICER | WORKER"
        boolean is_active
    }

    WORKER_PROFILES {
        uuid id PK
        uuid user_id FK
        string worker_code
        string trade_skill
        string emergency_contact
        string face_embedding_vector
    }

    ATTENDANCE_LOGS {
        uuid id PK
        uuid user_id FK
        uuid site_id FK
        timestamp clock_in
        timestamp clock_out
        float clock_in_lat
        float clock_in_lng
        boolean geofence_verified
        string status "PRESENT | LATE | OVERTIME"
    }

    CAMERAS {
        uuid id PK
        uuid site_id FK
        string camera_label
        string rtsp_stream_url
        string zone_name
        boolean is_online
    }

    SAFETY_INCIDENTS {
        uuid id PK
        uuid site_id FK
        uuid camera_id FK
        string violation_type
        string hazard_level "LOW | MEDIUM | HIGH | CRITICAL"
        string snapshot_url
        jsonb bounding_box
        float confidence
        timestamp detected_at
        boolean resolved
    }

    AUDIT_LOGS {
        uuid id PK
        uuid user_id FK
        string action
        string target_entity
        jsonb previous_state
        jsonb new_state
        timestamp timestamp
    }
```

---

## 3. Data Dictionary

### 3.1 `users` Table
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | Unique identifier |
| `organization_id` | UUID | FK -> organizations(id), ON DELETE CASCADE | Associated organization |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | Account email |
| `password_hash` | VARCHAR(255) | NOT NULL | Argon2id encrypted hash |
| `first_name` | VARCHAR(100) | NOT NULL | User first name |
| `last_name` | VARCHAR(100) | NOT NULL | User last name |
| `role` | VARCHAR(50) | NOT NULL | `ADMIN`, `SUPERVISOR`, `SAFETY_OFFICER`, `WORKER` |
| `is_active` | BOOLEAN | DEFAULT TRUE | Soft disable flag |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Record creation timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Record update timestamp |

### 3.2 `attendance_logs` Table (Partitioned by Month)
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK | Unique record ID |
| `user_id` | UUID | FK -> users(id) | Associated worker ID |
| `site_id` | UUID | FK -> sites(id) | Check-in worksite |
| `clock_in` | TIMESTAMPTZ | NOT NULL | Check-in timestamp |
| `clock_out` | TIMESTAMPTZ | NULL | Check-out timestamp |
| `clock_in_lat` | NUMERIC(10, 7) | NOT NULL | GPS latitude |
| `clock_in_lng` | NUMERIC(10, 7) | NOT NULL | GPS longitude |
| `geofence_verified` | BOOLEAN | DEFAULT FALSE | Verified inside site polygon |
| `device_id` | VARCHAR(128) | NOT NULL | Mobile device identifier |
| `status` | VARCHAR(32) | NOT NULL | `ON_DUTY`, `COMPLETED`, `FLAGGED` |

### 3.3 `safety_incidents` Table
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK | Unique incident ID |
| `site_id` | UUID | FK -> sites(id) | Location of violation |
| `camera_id` | UUID | FK -> cameras(id) | Source camera stream |
| `violation_type` | VARCHAR(64) | NOT NULL | `NO_HELMET`, `NO_VEST`, `RED_ZONE_ENTRY`, `FALL_DETECTED` |
| `hazard_level` | VARCHAR(16) | NOT NULL | `LOW`, `MEDIUM`, `HIGH`, `CRITICAL` |
| `snapshot_url` | TEXT | NOT NULL | S3 bucket URL to annotated image |
| `bounding_box` | JSONB | NOT NULL | Normalized bounding box coordinates `{x, y, w, h}` |
| `confidence` | NUMERIC(4, 3) | NOT NULL | AI model confidence score (e.g. 0.945) |
| `detected_at` | TIMESTAMPTZ | DEFAULT NOW() | Incident timestamp |
| `resolved` | BOOLEAN | DEFAULT FALSE | Flagged as addressed by safety officer |

---

## 4. Indexing & Optimization Strategy

1. **Spatial Indexing**: `CREATE INDEX idx_geofences_spatial ON geofences USING GIST (polygon_geom);` Enables sub-millisecond point-in-polygon queries for mobile check-ins.
2. **Attendance Time-Series Index**: `CREATE INDEX idx_attendance_user_date ON attendance_logs (user_id, clock_in DESC);` Accelerates worker history retrieval.
3. **Safety Incident Feed Index**: `CREATE INDEX idx_safety_site_time ON safety_incidents (site_id, detected_at DESC) WHERE resolved = FALSE;` Speeds up the real-time active incident query.
