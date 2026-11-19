import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtPayload, TokenRefreshResponse } from '../interfaces/auth.interfaces';
import { UserRole, UserStatus } from '@prisma/client';
import * as crypto from 'crypto';

@Injectable()
export class TokenService {
  private readonly logger = new Logger(TokenService.name);
  private readonly refreshTokenLifetimeDays = 7;

  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Hashes a string using SHA-256 for secure in-database storage.
   */
  hashToken(token: string): Uint8Array<ArrayBuffer> {
    return Uint8Array.from(crypto.createHash('sha256').update(token).digest()) as Uint8Array<ArrayBuffer>;
  }

  /**
   * Generates a cryptographically random refresh token string.
   */
  generateRefreshTokenString(): string {
    return crypto.randomBytes(40).toString('hex');
  }

  /**
   * Issues a short-lived JWT access token.
   */
  generateAccessToken(payload: JwtPayload): string {
    return this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET || 'labourlens_default_jwt_secret_min_32_chars',
      expiresIn: (process.env.JWT_EXPIRES_IN || '15m') as any,
    });
  }

  /**
   * Creates a new session record in auth_sessions and issues access and refresh tokens.
   */
  async createSession(
    user: { id: string; status: UserStatus },
    email: string,
    roles: UserRole[],
    userAgent?: string,
    ipAddress?: string,
  ): Promise<{ accessToken: string; refreshToken: string; expiresIn: number }> {
    const rawRefreshToken = this.generateRefreshTokenString();
    const tokenHash = this.hashToken(rawRefreshToken);
    const expiresAt = new Date(Date.now() + this.refreshTokenLifetimeDays * 24 * 60 * 60 * 1000);

    const ipHash = ipAddress ? crypto.createHash('sha256').update(ipAddress).digest('hex').substring(0, 64) : null;

    await this.prisma.authSession.create({
      data: {
        userId: user.id,
        tokenHash,
        userAgent: userAgent || null,
        ipAddressHash: ipHash,
        expiresAt,
      },
    });

    const jwtPayload: JwtPayload = {
      sub: user.id,
      email,
      roles,
      status: user.status,
    };

    const accessToken = this.generateAccessToken(jwtPayload);

    return {
      accessToken,
      refreshToken: rawRefreshToken,
      expiresIn: 900, // 15 minutes (in seconds)
    };
  }

  /**
   * Rotates a refresh token: invalidates the old session and creates a new one.
   * If a revoked token is presented, detects token reuse and invalidates all user sessions.
   */
  async rotateRefreshToken(
    rawRefreshToken: string,
    userAgent?: string,
    ipAddress?: string,
  ): Promise<TokenRefreshResponse> {
    const tokenHash = this.hashToken(rawRefreshToken);

    const session = await this.prisma.authSession.findUnique({
      where: { tokenHash },
      include: {
        user: {
          include: {
            identities: true,
            roleAssignments: {
              include: { role: true },
            },
          },
        },
      },
    });

    if (!session) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // Token Reuse Detection
    if (session.revokedAt) {
      this.logger.warn(`Suspicious activity: Revoked refresh token reuse detected for user ${session.userId}. Revoking all sessions.`);
      await this.revokeAllUserSessions(session.userId);
      throw new UnauthorizedException('Invalid refresh token. All active sessions have been invalidated for security.');
    }

    // Expiration Check
    if (session.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token has expired. Please sign in again.');
    }

    // Account Status Check
    const user = session.user;
    if (user.status === UserStatus.BANNED || user.status === UserStatus.SUSPENDED || user.status === UserStatus.DEACTIVATED) {
      throw new UnauthorizedException(`Account is ${user.status.toLowerCase()}. Access denied.`);
    }

    // Invalidate old session (Single-Use Token Rotation)
    await this.prisma.authSession.update({
      where: { id: session.id },
      data: { revokedAt: new Date() },
    });

    const primaryIdentity = user.identities.find(i => i.isPrimary) || user.identities[0];
    const roles = user.roleAssignments.map(a => a.role.code as UserRole);

    // Create fresh session
    const tokens = await this.createSession(user, primaryIdentity?.normalizedValue || '', roles, userAgent, ipAddress);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      tokenType: 'Bearer',
      expiresIn: tokens.expiresIn,
    };
  }

  /**
   * Revokes a session upon explicit logout.
   */
  async revokeSessionByToken(rawRefreshToken: string): Promise<boolean> {
    const tokenHash = this.hashToken(rawRefreshToken);
    const session = await this.prisma.authSession.findUnique({
      where: { tokenHash },
    });

    if (!session || session.revokedAt) {
      return false;
    }

    await this.prisma.authSession.update({
      where: { id: session.id },
      data: { revokedAt: new Date() },
    });

    return true;
  }

  /**
   * Revokes all sessions for a user (e.g. after password reset or security breach).
   */
  async revokeAllUserSessions(userId: string): Promise<void> {
    await this.prisma.authSession.updateMany({
      where: {
        userId,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });
  }
}
