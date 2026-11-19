import { Injectable, ConflictException, UnauthorizedException, BadRequestException, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PasswordService } from './password.service';
import { TokenService } from './token.service';
import { EmailService } from './email.service';
import { RegisterEmployerDto } from '../dto/register-employer.dto';
import { RegisterWorkerDto } from '../dto/register-worker.dto';
import { LoginDto } from '../dto/login.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { VerifyEmailDto } from '../dto/verify-email.dto';
import { AuthTokensResponse, TokenRefreshResponse, SanitizedUser } from '../interfaces/auth.interfaces';
import { UserRole, UserStatus, IdentityType } from '@prisma/client';
import * as crypto from 'crypto';

@Injectable()
export class AuthService implements OnModuleInit {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly passwordService: PasswordService,
    private readonly tokenService: TokenService,
    private readonly emailService: EmailService,
  ) {}

  /**
   * Automatically ensures standard RBAC roles exist in the database upon startup.
   */
  async onModuleInit() {
    await this.ensureRolesExist();
  }

  private async ensureRolesExist(): Promise<void> {
    const roles: Array<{ code: UserRole; name: string; description: string }> = [
      { code: UserRole.ADMIN, name: 'System Administrator', description: 'Full system management and configuration rights' },
      { code: UserRole.MODERATOR, name: 'Trust & Safety Moderator', description: 'Handles verification, complaints, and moderation actions' },
      { code: UserRole.EMPLOYER, name: 'Employer', description: 'Can post jobs, review candidates, hire workers, and submit reviews' },
      { code: UserRole.WORKER, name: 'Worker', description: 'Can search jobs, apply, receive hires, and record credentials' },
    ];

    for (const r of roles) {
      const existing = await this.prisma.role.findUnique({ where: { code: r.code } });
      if (!existing) {
        await this.prisma.role.create({
          data: {
            code: r.code,
            name: r.name,
            description: r.description,
          },
        });
        this.logger.log(`Initialized default role: ${r.code}`);
      }
    }
  }

  /**
   * Helper to sanitize user output, removing any sensitive data.
   */
  private sanitizeUser(user: any, email: string, roles: UserRole[]): SanitizedUser {
    return {
      id: user.id,
      email,
      status: user.status,
      preferredLocale: user.preferredLocale,
      roles,
      createdAt: user.createdAt,
      employerProfile: user.employerProfile
        ? {
            id: user.employerProfile.id,
            displayName: user.employerProfile.displayName,
            employerType: user.employerProfile.employerType,
            isVerified: user.employerProfile.isVerified,
          }
        : null,
      workerProfile: user.workerProfile
        ? {
            id: user.workerProfile.id,
            displayName: user.workerProfile.displayName,
            isAvailable: user.workerProfile.isAvailable,
            verificationLevel: user.workerProfile.verificationLevel,
            profileVisibility: user.workerProfile.profileVisibility,
          }
        : null,
    };
  }

  /**
   * Registers a new Employer account and creates profile.
   */
  async registerEmployer(
    dto: RegisterEmployerDto,
    reqInfo?: { userAgent?: string; ipAddress?: string },
  ): Promise<AuthTokensResponse> {
    if (!dto.confirmPassword || dto.confirmPassword !== dto.password) {
      throw new BadRequestException('Password confirmation does not match');
    }

    const normalizedCnic = this.normalizeCnic(dto.cnic);
    const existingCnic = await this.prisma.user.findUnique({ where: { cnic: normalizedCnic } });
    if (existingCnic) throw new ConflictException('An account with this CNIC already exists');

    const normalizedEmail = dto.email.toLowerCase().trim();

    // Check duplicate email identity
    const existingIdentity = await this.prisma.userIdentity.findUnique({
      where: { normalizedValue: normalizedEmail },
    });
    if (existingIdentity) {
      throw new ConflictException('An account with this email address already exists');
    }

    const employerRole = await this.prisma.role.findUnique({ where: { code: UserRole.EMPLOYER } });
    if (!employerRole) {
      throw new Error('EMPLOYER role missing in database');
    }

    const passwordHash = await this.passwordService.hash(dto.password);

    // Database transaction creating User, Identity, Role Assignment, and Employer Profile
    const user = await this.prisma.$transaction(async tx => {
      const newUser = await tx.user.create({
        data: {
          cnic: normalizedCnic,
          status: UserStatus.ACTIVE,
          preferredLocale: 'ur-PK',
        },
      });

      // Primary email identity
      await tx.userIdentity.create({
        data: {
          userId: newUser.id,
          identityType: IdentityType.EMAIL,
          normalizedValue: normalizedEmail,
          passwordHash,
          isPrimary: true,
        },
      });

      // Optional phone identity
      if (dto.phone) {
        await tx.userIdentity.create({
          data: {
            userId: newUser.id,
            identityType: IdentityType.PHONE,
            normalizedValue: dto.phone.trim(),
            isPrimary: false,
          },
        });
      }

      // Assign Employer Role
      await tx.userRoleAssignment.create({
        data: {
          userId: newUser.id,
          roleId: employerRole.id,
        },
      });

      // Create Employer Profile
      await tx.employerProfile.create({
        data: {
          userId: newUser.id,
          displayName: dto.displayName,
          employerType: dto.employerType || undefined,
          ntnTaxNumber: dto.ntnTaxNumber || null,
          description: dto.description || null,
        },
      });

      return tx.user.findUniqueOrThrow({
        where: { id: newUser.id },
        include: { employerProfile: true },
      });
    }).catch(error => this.handleUniqueConstraintError(error));

    const roles = [UserRole.EMPLOYER];
    const session = await this.tokenService.createSession(
      user,
      normalizedEmail,
      roles,
      reqInfo?.userAgent,
      reqInfo?.ipAddress,
    );

    // Dispatch verification email in background
    const verificationToken = this.emailService.generateEmailVerificationToken(user.id, normalizedEmail);
    await this.emailService.sendVerificationEmail(normalizedEmail, verificationToken);

    return {
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
      tokenType: 'Bearer',
      expiresIn: session.expiresIn,
      user: this.sanitizeUser(user, normalizedEmail, roles),
    };
  }

  /**
   * Registers a new Worker account and creates worker profile.
   */
  async registerWorker(
    dto: RegisterWorkerDto,
    reqInfo?: { userAgent?: string; ipAddress?: string },
  ): Promise<AuthTokensResponse> {
    if (!dto.confirmPassword || dto.confirmPassword !== dto.password) {
      throw new BadRequestException('Password confirmation does not match');
    }

    const normalizedCnic = this.normalizeCnic(dto.cnic);
    const existingCnic = await this.prisma.user.findUnique({ where: { cnic: normalizedCnic } });
    if (existingCnic) throw new ConflictException('An account with this CNIC already exists');

    const normalizedEmail = dto.email.toLowerCase().trim();

    // Check duplicate email identity
    const existingIdentity = await this.prisma.userIdentity.findUnique({
      where: { normalizedValue: normalizedEmail },
    });
    if (existingIdentity) {
      throw new ConflictException('An account with this email address already exists');
    }

    const workerRole = await this.prisma.role.findUnique({ where: { code: UserRole.WORKER } });
    if (!workerRole) {
      throw new Error('WORKER role missing in database');
    }

    const passwordHash = await this.passwordService.hash(dto.password);

    // Database transaction creating User, Identity, Role Assignment, Worker Profile & Skills
    const user = await this.prisma.$transaction(async tx => {
      const newUser = await tx.user.create({
        data: {
          cnic: normalizedCnic,
          status: UserStatus.ACTIVE,
          preferredLocale: 'ur-PK',
        },
      });

      // Primary email identity
      await tx.userIdentity.create({
        data: {
          userId: newUser.id,
          identityType: IdentityType.EMAIL,
          normalizedValue: normalizedEmail,
          passwordHash,
          isPrimary: true,
        },
      });

      // Optional phone identity
      if (dto.phone) {
        await tx.userIdentity.create({
          data: {
            userId: newUser.id,
            identityType: IdentityType.PHONE,
            normalizedValue: dto.phone.trim(),
            isPrimary: false,
          },
        });
      }

      // Assign Worker Role
      await tx.userRoleAssignment.create({
        data: {
          userId: newUser.id,
          roleId: workerRole.id,
        },
      });

      // Create Worker Profile
      const workerProfile = await tx.workerProfile.create({
        data: {
          userId: newUser.id,
          displayName: dto.displayName,
          gender: dto.gender || null,
          primaryCategoryId: dto.primaryCategoryId || null,
          bio: dto.bio || null,
          experienceMonths: dto.experienceMonths ?? 0,
          preferredEngagementType: dto.preferredEngagementType || undefined,
        },
      });

      // Attach optional skills
      if (dto.skillIds && dto.skillIds.length > 0) {
        for (const skillId of dto.skillIds) {
          await tx.workerSkill.create({
            data: {
              workerProfileId: workerProfile.id,
              skillId,
              proficiencyLevel: 3,
            },
          });
        }
      }

      return tx.user.findUniqueOrThrow({
        where: { id: newUser.id },
        include: { workerProfile: true },
      });
    }).catch(error => this.handleUniqueConstraintError(error));

    const roles = [UserRole.WORKER];
    const session = await this.tokenService.createSession(
      user,
      normalizedEmail,
      roles,
      reqInfo?.userAgent,
      reqInfo?.ipAddress,
    );

    // Dispatch verification email in background
    const verificationToken = this.emailService.generateEmailVerificationToken(user.id, normalizedEmail);
    await this.emailService.sendVerificationEmail(normalizedEmail, verificationToken);

    return {
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
      tokenType: 'Bearer',
      expiresIn: session.expiresIn,
      user: this.sanitizeUser(user, normalizedEmail, roles),
    };
  }

  /**
   * Authenticates user using normalized CNIC and password.
   * Uses generic error messages to prevent account enumeration.
   */
  async login(
    dto: LoginDto,
    reqInfo?: { userAgent?: string; ipAddress?: string },
  ): Promise<AuthTokensResponse> {
    const normalizedCnic = this.normalizeCnic(dto.cnic);
    const user = await this.prisma.user.findUnique({
      where: { cnic: normalizedCnic },
      include: {
        identities: true,
        employerProfile: true,
        workerProfile: true,
        roleAssignments: { include: { role: true } },
      },
    });
    const emailIdentity = user?.identities.find(identity => identity.identityType === IdentityType.EMAIL);

    if (!user || !emailIdentity?.passwordHash) {
      throw new UnauthorizedException('Invalid CNIC or password');
    }

    const isPasswordValid = await this.passwordService.compare(dto.password, emailIdentity.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid CNIC or password');
    }

    // Account status check
    if (user.deletedAt) {
      throw new UnauthorizedException('This account has been deleted');
    }

    if (user.status === UserStatus.BANNED) {
      throw new UnauthorizedException('Account has been suspended permanently due to policy violations');
    }

    if (user.status === UserStatus.SUSPENDED) {
      throw new UnauthorizedException('Account is temporarily suspended. Please contact support');
    }

    if (user.status === UserStatus.DEACTIVATED) {
      throw new UnauthorizedException('Account is deactivated');
    }

    const roles = user.roleAssignments.map(a => a.role.code as UserRole);

    const session = await this.tokenService.createSession(
      user,
      emailIdentity.normalizedValue,
      roles,
      reqInfo?.userAgent,
      reqInfo?.ipAddress,
    );

    return {
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
      tokenType: 'Bearer',
      expiresIn: session.expiresIn,
      user: this.sanitizeUser(user, emailIdentity.normalizedValue, roles),
    };
  }

  private normalizeCnic(value: string): string {
    return value.replace(/[\s-]/g, '');
  }

  private handleUniqueConstraintError(error: unknown): never {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      throw new ConflictException('An account with this CNIC or email already exists');
    }
    throw error;
  }

  /**
   * Rotates a valid refresh token and issues a new access token.
   */
  async refresh(
    dto: RefreshTokenDto,
    reqInfo?: { userAgent?: string; ipAddress?: string },
  ): Promise<TokenRefreshResponse> {
    return this.tokenService.rotateRefreshToken(dto.refreshToken, reqInfo?.userAgent, reqInfo?.ipAddress);
  }

  /**
   * Logs out the user by revoking the refresh token session.
   */
  async logout(dto: RefreshTokenDto): Promise<{ message: string }> {
    await this.tokenService.revokeSessionByToken(dto.refreshToken);
    return { message: 'Successfully logged out and session revoked' };
  }

  /**
   * Initiates forgot password workflow.
   * Always returns a generic success message to prevent email enumeration.
   */
  async forgotPassword(dto: ForgotPasswordDto): Promise<{ message: string }> {
    const normalizedEmail = dto.email.toLowerCase().trim();

    const identity = await this.prisma.userIdentity.findUnique({
      where: { normalizedValue: normalizedEmail },
    });

    if (identity) {
      const rawToken = crypto.randomBytes(32).toString('hex');
      const tokenHash = Uint8Array.from(crypto.createHash('sha256').update(rawToken).digest()) as Uint8Array<ArrayBuffer>;
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

      await this.prisma.passwordResetToken.create({
        data: {
          userId: identity.userId,
          tokenHash,
          expiresAt,
        },
      });

      await this.emailService.sendPasswordResetEmail(normalizedEmail, rawToken);
    }

    return {
      message: 'If an account with that email exists, password reset instructions have been sent.',
    };
  }

  /**
   * Resets password using a validated single-use reset token.
   */
  async resetPassword(dto: ResetPasswordDto): Promise<{ message: string }> {
    const tokenHash = Uint8Array.from(crypto.createHash('sha256').update(dto.token).digest()) as Uint8Array<ArrayBuffer>;

    const tokenRecord = await this.prisma.passwordResetToken.findUnique({
      where: { tokenHash },
    });

    if (!tokenRecord || tokenRecord.consumedAt || tokenRecord.expiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired password reset token');
    }

    const newPasswordHash = await this.passwordService.hash(dto.newPassword);

    await this.prisma.$transaction(async tx => {
      // Update password hash on primary email identity
      await tx.userIdentity.updateMany({
        where: {
          userId: tokenRecord.userId,
          identityType: IdentityType.EMAIL,
        },
        data: {
          passwordHash: newPasswordHash,
        },
      });

      // Mark token consumed
      await tx.passwordResetToken.update({
        where: { id: tokenRecord.id },
        data: { consumedAt: new Date() },
      });
    });

    // Invalidate all active sessions for security
    await this.tokenService.revokeAllUserSessions(tokenRecord.userId);

    return {
      message: 'Password has been reset successfully. Please log in with your new password.',
    };
  }

  /**
   * Verifies an email address using a signed verification token.
   */
  async verifyEmail(dto: VerifyEmailDto): Promise<{ message: string }> {
    let decoded: { sub: string; email: string };
    try {
      decoded = this.emailService.verifyEmailToken(dto.token);
    } catch {
      throw new BadRequestException('Invalid or expired email verification token');
    }

    const identity = await this.prisma.userIdentity.findFirst({
      where: {
        userId: decoded.sub,
        normalizedValue: decoded.email.toLowerCase().trim(),
      },
    });

    if (!identity) {
      throw new BadRequestException('Verification identity not found');
    }

    await this.prisma.$transaction(async tx => {
      await tx.userIdentity.update({
        where: { id: identity.id },
        data: { verifiedAt: new Date() },
      });

      await tx.user.update({
        where: { id: decoded.sub },
        data: { status: UserStatus.ACTIVE },
      });
    });

    return {
      message: 'Email address verified successfully.',
    };
  }

  /**
   * Returns sanitized profile of currently authenticated user.
   */
  async getMe(userId: string): Promise<SanitizedUser> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        identities: true,
        employerProfile: true,
        workerProfile: true,
        roleAssignments: {
          include: { role: true },
        },
      },
    });

    if (!user || user.deletedAt) {
      throw new UnauthorizedException('User account not found');
    }

    const primaryIdentity = user.identities.find(i => i.isPrimary) || user.identities[0];
    const roles = user.roleAssignments.map(a => a.role.code as UserRole);

    return this.sanitizeUser(user, primaryIdentity?.normalizedValue || '', roles);
  }
}
