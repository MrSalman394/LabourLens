import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './services/auth.service';
import { PasswordService } from './services/password.service';
import { TokenService } from './services/token.service';
import { EmailService } from './services/email.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { OwnershipGuard } from './guards/ownership.guard';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: process.env.JWT_SECRET || 'labourlens_default_jwt_secret_min_32_chars',
        signOptions: {
          expiresIn: (process.env.JWT_EXPIRES_IN || '15m') as any,
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    PasswordService,
    TokenService,
    EmailService,
    JwtStrategy,
    JwtAuthGuard,
    RolesGuard,
    OwnershipGuard,
  ],
  exports: [
    AuthService,
    PasswordService,
    TokenService,
    EmailService,
    JwtAuthGuard,
    RolesGuard,
    OwnershipGuard,
    JwtModule,
  ],
})
export class AuthModule {}
