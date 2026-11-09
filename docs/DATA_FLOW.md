# End-to-End Data Flow & Sequence Workflows

## 1. Overview

This document maps out the end-to-end sequence flows across all tiers of LabourLens: Mobile App, NestJS API, Python AI Service, PostgreSQL DB, Redis Pub/Sub, and Next.js Web Portal.

---

## 2. Workflow 1: Worker Geofenced Clock-In

```mermaid
sequenceDiagram
    autonumber
    actor Worker as Field Worker
    participant Mobile as Flutter App
    participant GPS as Device GPS / OS
    participant API as NestJS API
    participant DB as PostgreSQL
    participant Redis as Redis Pub/Sub
    participant Web as Next.js Dashboard

    Worker->>Mobile: Tap "Clock In"
    Mobile->>GPS: Request high-accuracy coordinates
    GPS-->>Mobile: Return (lat, lng, accuracy, isMocked)
    
    alt Mock Location Detected
        Mobile-->>Worker: Show Error ("Mock location detected")
    else Location Legitimate
        Mobile->>Mobile: Verify inside local polygon cache
        Mobile->>API: POST /api/v1/attendance/clock-in (coords, siteId, timestamp)
        API->>DB: Query site geofence (ST_Contains PostGIS check)
        
        alt Outside Boundary
            API-->>Mobile: 400 Bad Request ("Outside geofence")
            Mobile-->>Worker: Display out-of-bounds error
        else Inside Boundary
            API->>DB: Insert attendance_logs record (status: ON_DUTY)
            API->>Redis: Publish "site:attendance" event
            Redis->>Web: WebSocket broadcast (Active worker count +1)
            API-->>Mobile: 201 Created (Attendance confirmed)
            Mobile-->>Worker: Show success checkmark & active shift timer
        end
    end
```

---

## 3. Workflow 2: Real-Time PPE Safety Violation Detection

```mermaid
sequenceDiagram
    autonumber
    participant Cam as Site CCTV Camera
    participant AI as Python AI Service (YOLOv8)
    participant S3 as MinIO / S3 Storage
    participant API as NestJS API
    participant DB as PostgreSQL
    participant Web as Next.js Web Dashboard
    actor SafetyOfficer as Safety Officer

    Cam->>AI: RTSP Video Stream (Continuous frames)
    AI->>AI: Sample frame (5 FPS) & Run YOLOv8 PPE detection
    
    opt Violation Detected (e.g. Person without Hard Hat)
        AI->>AI: ByteTrack verifies target across 5 consecutive frames
        AI->>AI: Draw bounding boxes & violation text on frame
        AI->>S3: Upload annotated snapshot image
        S3-->>AI: Return snapshot URL
        
        AI->>API: POST /api/v1/safety/detections (siteId, camId, violation, snapshotUrl)
        API->>DB: Insert safety_incidents record (resolved: false)
        API->>API: Emit WebSocket event ("safety_violation_alert")
        API-->>Web: Socket.io alert to active site room
        Web-->>SafetyOfficer: Play alert tone & pop up incident card
        
        SafetyOfficer->>Web: Click "Acknowledge / Dispatch Radio Call"
        Web->>API: PATCH /api/v1/safety/incidents/:id (resolved: true)
        API->>DB: Update incident record
    end
```

---

## 4. Workflow 3: Mobile Offline-First Attendance Queue & Resync

```mermaid
sequenceDiagram
    autonumber
    actor Worker as Field Worker
    participant Mobile as Flutter App
    participant LocalDB as Local Hive Storage
    participant NetMonitor as Connectivity Listener
    participant API as NestJS API

    Worker->>Mobile: Tap "Clock Out" (Zero Cell Coverage)
    Mobile->>LocalDB: Save record (clockOutTime, coords, syncStatus: PENDING)
    Mobile-->>Worker: Confirm saved locally ("Will sync when online")
    
    Note over Mobile,NetMonitor: Worker leaves remote tunnel / re-enters cellular zone
    
    NetMonitor->>Mobile: Network connectivity restored (4G / Wi-Fi)
    Mobile->>LocalDB: Fetch all records with syncStatus == PENDING (FIFO)
    loop For each pending event
        Mobile->>API: POST /api/v1/attendance/sync-offline-event
        API-->>Mobile: 200 OK (Event logged with original client timestamp)
        Mobile->>LocalDB: Update syncStatus: SYNCED
    end
    Mobile-->>Worker: Show notification ("All offline events synced successfully")
```
