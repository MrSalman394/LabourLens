# REST & WebSocket API Specification

## 1. Protocol & Conventions

- **Base URL**: `https://api.labourlens.io/api/v1` (Local: `http://localhost:4000/api/v1`)
- **Format**: JSON (`Content-Type: application/json`)
- **Authentication**: Bearer Token in `Authorization` header (`Bearer <access_token>`)
- **Date Format**: ISO 8601 (`YYYY-MM-DDTHH:mm:ss.sssZ`)

### Standard HTTP Status Codes
| Code | Meaning | Usage |
|---|---|---|
| `200 OK` | Success | Successful GET, PUT, PATCH request |
| `201 Created` | Created | Resource successfully created via POST |
| `204 No Content` | No Content | Successful DELETE request |
| `400 Bad Request` | Validation Error | Malformed JSON or failed class-validator check |
| `401 Unauthorized` | Unauthenticated | Missing or expired JWT token |
| `403 Forbidden` | Access Denied | Insufficient permissions for user role |
| `404 Not Found` | Not Found | Requested entity does not exist |
| `429 Too Many Requests` | Rate Limited | Exceeded API rate limits |
| `500 Internal Error` | Server Failure | Unhandled backend exception |

---

## 2. Authentication Endpoints (`/auth`)

### 2.1 Worker / Admin Login
- **Endpoint**: `POST /auth/login`
- **Request Body**:
```json
{
  "email": "supervisor@labourlens.io",
  "password": "SecurePassword123!"
}
```
- **Response `200 OK`**:
```json
{
  "statusCode": 200,
  "data": {
    "accessToken": "eyJhbGciOi...",
    "refreshToken": "d8a1f8e2...",
    "expiresIn": 900,
    "user": {
      "id": "usr_991823ab",
      "firstName": "John",
      "lastName": "Doe",
      "role": "SUPERVISOR",
      "siteId": "site_782390ff"
    }
  }
}
```

### 2.2 Token Refresh
- **Endpoint**: `POST /auth/refresh`
- **Request Body**:
```json
{
  "refreshToken": "d8a1f8e2..."
}
```
- **Response `200 OK`**:
```json
{
  "statusCode": 200,
  "data": {
    "accessToken": "eyJhbGciOi...",
    "expiresIn": 900
  }
}
```

---

## 3. Attendance & Geofence Endpoints (`/attendance`)

### 3.1 Clock-In (Geofenced)
- **Endpoint**: `POST /attendance/clock-in`
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
```json
{
  "siteId": "site_782390ff",
  "latitude": 33.6844,
  "longitude": 73.0479,
  "accuracy": 4.2,
  "deviceId": "android_98a7281",
  "isMockLocation": false,
  "clientTimestamp": "2026-11-09T08:00:00.000Z"
}
```
- **Response `201 Created`**:
```json
{
  "statusCode": 201,
  "data": {
    "attendanceId": "att_182903fe",
    "workerId": "usr_781293ac",
    "siteName": "Main Metro Station Project",
    "clockInTime": "2026-11-09T08:00:01.120Z",
    "status": "ON_DUTY",
    "geofenceVerified": true
  }
}
```

### 3.2 Clock-Out
- **Endpoint**: `POST /attendance/clock-out`
- **Request Body**:
```json
{
  "siteId": "site_782390ff",
  "latitude": 33.6845,
  "longitude": 73.0480,
  "clientTimestamp": "2026-11-09T17:00:00.000Z"
}
```
- **Response `200 OK`**:
```json
{
  "statusCode": 200,
  "data": {
    "attendanceId": "att_182903fe",
    "clockOutTime": "2026-11-09T17:00:02.430Z",
    "totalHours": 9.0,
    "status": "COMPLETED"
  }
}
```

---

## 4. AI & Safety Endpoints (`/safety`)

### 4.1 Log AI Detection / Violation
- **Endpoint**: `POST /safety/detections`
- **Description**: Ingests detections from the Python AI microservice.
- **Request Body**:
```json
{
  "siteId": "site_782390ff",
  "cameraId": "cam_zone_b_north",
  "timestamp": "2026-11-09T10:14:23.000Z",
  "violationType": "MISSING_PPE_HARDHAT",
  "confidence": 0.94,
  "snapshotUrl": "https://storage.labourlens.io/snapshots/2026/11/09/violation_123.jpg",
  "boundingBox": {
    "x": 320,
    "y": 140,
    "width": 110,
    "height": 220
  },
  "hazardLevel": "HIGH"
}
```
- **Response `201 Created`**:
```json
{
  "statusCode": 201,
  "data": {
    "incidentId": "inc_901238aa",
    "alertBroadcasted": true
  }
}
```

---

## 5. WebSockets Gateway (Real-Time Safety & Attendance)

- **Gateway URL**: `wss://api.labourlens.io/events` (Socket.io namespace: `/events`)
- **Auth**: Connection handshake query `{ token: "<jwt_token>" }`

### Client-to-Server Events
- `join_site_room`: `{ siteId: "site_782390ff" }` - Subscribes to real-time events for a specific worksite.
- `leave_site_room`: `{ siteId: "site_782390ff" }` - Unsubscribes from site events.

### Server-to-Client Broadcasts
- `safety_violation_alert`:
```json
{
  "incidentId": "inc_901238aa",
  "siteId": "site_782390ff",
  "zone": "Tower 2 - 4th Floor",
  "type": "MISSING_PPE_HARDHAT",
  "hazardLevel": "HIGH",
  "snapshotUrl": "https://storage.labourlens.io/snapshots/...",
  "timestamp": "2026-11-09T10:14:23.000Z"
}
```
- `attendance_status_update`:
```json
{
  "siteId": "site_782390ff",
  "activeWorkersCount": 142,
  "change": "+1",
  "workerName": "Ali Khan",
  "timestamp": "2026-11-09T08:05:00.000Z"
}
```
