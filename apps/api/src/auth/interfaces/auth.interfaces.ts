import { UserRole, UserStatus } from '@prisma/client';

export interface JwtPayload {
  sub: string; // User ID
  email: string;
  roles: UserRole[];
  status: UserStatus;
  iat?: number;
  exp?: number;
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  roles: UserRole[];
  status: UserStatus;
}

export interface SanitizedUser {
  id: string;
  email: string;
  displayName?: string | null;
  status: UserStatus;
  preferredLocale: string;
  roles: UserRole[];
  createdAt: Date;
  employerProfile?: {
    id: string;
    displayName: string;
    employerType: string;
    isVerified: boolean;
  } | null;
  workerProfile?: {
    id: string;
    displayName: string;
    isAvailable: boolean;
    verificationLevel: string;
    profileVisibility: string;
  } | null;
}

export interface AuthTokensResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: SanitizedUser;
}

export interface TokenRefreshResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
}
