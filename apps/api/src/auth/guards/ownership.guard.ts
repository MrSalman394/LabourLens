import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { AuthenticatedUser } from '../interfaces/auth.interfaces';

@Injectable()
export class OwnershipGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user: AuthenticatedUser = request.user;
    const targetUserId = request.params.userId || request.params.id;

    if (!user) {
      return false;
    }

    // Admins have global permission
    if (user.roles?.includes(UserRole.ADMIN)) {
      return true;
    }

    // If a target user ID parameter exists, verify match
    if (targetUserId && targetUserId !== user.id) {
      throw new ForbiddenException('You do not have permission to access or modify this user resource');
    }

    return true;
  }
}
