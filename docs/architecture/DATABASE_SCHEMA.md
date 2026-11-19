# Database Schema & Relational Models

## 1. Relational Entity Overview

The LabourLens PostgreSQL schema stores enterprise organizational entities, spatial geofences, worker profiles, job requisitions, attendance logs, and real-time safety violations.

```mermaid
erDiagram
    ORGANIZATIONS ||--o{ SITES : operates
    ORGANIZATIONS ||--o{ USERS : employs
    SITES ||--o{ GEOFENCES : defines
    SITES ||--o{ CAMERAS : hosts
    SITES ||--o{ SHIFTS : schedules
    SITES ||--o{ SAFETY_INCIDENTS : tracks
    USERS ||--o| WORKER_PROFILES : has
    USERS ||--o{ ATTENDANCE_LOGS : records
    USERS ||--o{ JOB_APPLICATIONS : submits
    SHIFTS ||--o{ ATTENDANCE_LOGS : bounds
    CAMERAS ||--o{ SAFETY_INCIDENTS : records
    JOBS ||--o{ JOB_APPLICATIONS : receives
    ORGANIZATIONS ||--o{ JOBS : posts

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
        geometry polygon_geom "PostGIS Polygon (SRID 4326)"
        float radius_meters
        boolean is_active
    }

    USERS {
        uuid id PK
        uuid organization_id FK
        string email UK
        string password_hash
        string first_name
        string last_name
        string role "ADMIN | SUPERVISOR | SAFETY_OFFICER | WORKER"
        boolean is_active
    }

    WORKER_PROFILES {
        uuid id PK
        uuid user_id FK
        string trade_specialty
        string[] certifications
        float overall_rating
        float safety_score
        float home_latitude
        float home_longitude
    }

    JOBS {
        uuid id PK
        uuid organization_id FK
        uuid site_id FK
        string title
        string required_trade
        string[] required_certifications
        timestamp start_date
        timestamp end_date
        string status "OPEN | FILLED | COMPLETED"
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
        string status "ON_DUTY | COMPLETED | FLAGGED"
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
```

---

## 2. Table Specifications & Indexes

### 2.1 PostGIS Geofence Spatial Index
```sql
CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE geofences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    polygon_geom GEOMETRY(Polygon, 4326) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fast spatial containment index
CREATE INDEX idx_geofences_spatial ON geofences USING GIST (polygon_geom);
```

### 2.2 Attendance Logs Indexing Strategy
```sql
CREATE INDEX idx_attendance_user_site ON attendance_logs (user_id, site_id, clock_in DESC);
CREATE INDEX idx_attendance_date_status ON attendance_logs (clock_in DESC, status);
```

### 2.3 Safety Incidents Triage Index
```sql
CREATE INDEX idx_safety_unresolved ON safety_incidents (site_id, detected_at DESC) WHERE resolved = FALSE;
```

