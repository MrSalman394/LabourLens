# System Integration Guide

## 1. Third-Party & Peripheral Integrations

LabourLens integrates with four primary external systems:
1. **IP / CCTV Camera Networks (RTSP / ONVIF Streams)**
2. **Object Storage Services (MinIO / AWS S3)**
3. **Push Notification Providers (Firebase Cloud Messaging - FCM)**
4. **Enterprise Payroll & ERP Systems (CSV / REST Export)**

---

## 2. IP Camera & RTSP Stream Integration

### 2.1 Supported Camera Protocols
- **RTSP**: `rtsp://<user>:<pass>@<camera_ip>:<port>/live/channel1`
- **ONVIF**: Standard discovery profile S/T for PTZ control and stream enumeration.
- **WebRTC / HLS**: Transcoded for real-time browser playback in `apps/web`.

### 2.2 Camera Configuration Checklist
1. Ensure camera video codec is set to **H.264** or **H.265**.
2. Set camera stream frame rate to **15–20 FPS** at **1080p** resolution.
3. Configure the camera endpoint in the Web Portal under `/cameras`. The AI microservice will automatically initiate a background decoding worker.

---

## 3. Object Storage Integration (S3 / MinIO)

### 3.1 Bucket Hierarchy
```text
labourlens-media/
├── snapshots/
│   └── {organization_id}/
│       └── {site_id}/
│           └── {YYYY}/{MM}/{DD}/
│               └── incident_{uuid}.jpg
└── profile_photos/
    └── {user_id}.jpg
```

### 3.2 Presigned URL Generation
To maintain strict access control, private media files are accessed via short-lived (15-minute) presigned URLs generated on the backend:
```typescript
const presignedUrl = await s3Client.getSignedUrlPromise('getObject', {
  Bucket: 'labourlens-media',
  Key: snapshotKey,
  Expires: 900, // 15 minutes
});
```

---

## 4. Mobile Push Notifications (FCM)

For emergency broadcasts and critical safety violation escalations:
1. Mobile devices register their FCM device token upon authentication (`POST /notifications/register-token`).
2. High-priority messages trigger native heads-up notifications with custom alarm sounds on Android and iOS even if the application is backgrounded.
