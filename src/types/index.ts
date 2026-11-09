/**
 * LabourLens Core Domain Types
 */

export enum UserRole {
  ADMIN = 'ADMIN',
  SUPERVISOR = 'SUPERVISOR',
  SAFETY_OFFICER = 'SAFETY_OFFICER',
  WORKER = 'WORKER',
}

export enum ShiftStatus {
  SCHEDULED = 'SCHEDULED',
  ON_DUTY = 'ON_DUTY',
  LATE = 'LATE',
  COMPLETED = 'COMPLETED',
  ABSENT = 'ABSENT',
  FLAGGED = 'FLAGGED',
}

export enum HazardLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum SafetyViolationType {
  MISSING_HARD_HAT = 'MISSING_HARD_HAT',
  MISSING_SAFETY_VEST = 'MISSING_SAFETY_VEST',
  MISSING_SAFETY_BOOTS = 'MISSING_SAFETY_BOOTS',
  MISSING_SAFETY_GLOVES = 'MISSING_SAFETY_GLOVES',
  MISSING_SAFETY_HARNESS = 'MISSING_SAFETY_HARNESS',
  RED_ZONE_INTRUSION = 'RED_ZONE_INTRUSION',
  FALL_DETECTED = 'FALL_DETECTED',
}

export interface GeofenceCoordinate {
  latitude: number;
  longitude: number;
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SafetyIncidentEvent {
  incidentId: string;
  siteId: string;
  cameraId: string;
  violationType: SafetyViolationType;
  hazardLevel: HazardLevel;
  confidence: number;
  snapshotUrl: string;
  boundingBox: BoundingBox;
  timestamp: string;
}

export interface WorkerMatchScore {
  workerId: string;
  compositeScore: number;
  skillScore: number;
  distanceScore: number;
  reliabilityScore: number;
  safetyScore: number;
  explanations: string[];
}
