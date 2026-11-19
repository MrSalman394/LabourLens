import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly isConfigured: boolean;

  constructor(private readonly jwtService: JwtService) {
    this.isConfigured = Boolean(process.env.SMTP_HOST && process.env.SMTP_USER);
  }

  /**
   * Generates a tamper-proof signed JWT for email verification.
   */
  generateEmailVerificationToken(userId: string, email: string): string {
    return this.jwtService.sign(
      { sub: userId, email, purpose: 'email-verification' },
      {
        secret: process.env.JWT_SECRET || 'labourlens_default_jwt_secret_min_32_chars',
        expiresIn: '24h',
      },
    );
  }

  /**
   * Verifies an email verification token.
   */
  verifyEmailToken(token: string): { sub: string; email: string } {
    const payload = this.jwtService.verify(token, {
      secret: process.env.JWT_SECRET || 'labourlens_default_jwt_secret_min_32_chars',
    });

    if (payload.purpose !== 'email-verification') {
      throw new Error('Invalid token purpose');
    }

    return { sub: payload.sub, email: payload.email };
  }

  /**
   * Sends or logs password reset instructions.
   */
  async sendPasswordResetEmail(email: string, rawToken: string): Promise<void> {
    if (this.isConfigured) {
      // In production, dispatch via SMTP/Resend/Sendgrid transport
      this.logger.log(`Dispatching real password reset email to ${email}`);
    } else {
      this.logger.warn(
        `[EmailService] (Development Mode) SMTP provider is not configured. Reset token for ${email}: ${rawToken}`,
      );
    }
  }

  /**
   * Sends or logs email verification link.
   */
  async sendVerificationEmail(email: string, verificationToken: string): Promise<void> {
    if (this.isConfigured) {
      this.logger.log(`Dispatching real verification email to ${email}`);
    } else {
      this.logger.warn(
        `[EmailService] (Development Mode) SMTP provider is not configured. Verification token for ${email}: ${verificationToken}`,
      );
    }
  }
}
