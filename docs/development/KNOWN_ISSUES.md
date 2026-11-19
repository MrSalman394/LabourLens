# Known Issues, Constraints & Workarounds

## 1. Technical Constraints & Known Edge Cases

### 1.1 GPS Multipath Interference in Deep Urban Canyons / Underground Tunnels
- **Symptom**: GPS signal bounces off tall concrete/glass structures or drops underground, leading to horizontal accuracy readings $>30\text{ meters}$.
- **Impact**: Can trigger false out-of-bounds rejection during mobile clock-in.
- **Mitigation / Workaround**: The mobile client averages GPS fixes across a 5-second sampling window. If accuracy remains poor, supervisor manual override is allowed with mandatory reason logging.

### 1.2 Camera Glare & Low-Light Night Shifts
- **Symptom**: Harsh floodlights or heavy rain create high-contrast glares, causing YOLOv8 to drop confidence scores on dark safety vests below the $0.70$ threshold.
- **Mitigation / Workaround**: AI pipeline incorporates HSV contrast enhancement pre-processing and temporal tracking persistence (ByteTrack retains PPE status across brief 1-2 frame occlusions).

### 1.3 Mobile Background Location Restrictions
- **Symptom**: Modern Android 13+ and iOS 16+ aggressively kill long-running background location tasks to preserve battery life.
- **Mitigation / Workaround**: LabourLens intentionally avoids continuous battery-draining GPS tracking. Location is polled on-demand exclusively during Clock-In, Clock-Out, and explicitly triggered hazard submissions.

