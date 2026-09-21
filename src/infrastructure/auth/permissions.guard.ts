import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY, PermissionType } from './permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<PermissionType[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const user = request.user;

    if (!user) {
      const isApi =
        request.url.startsWith('/api') ||
        (request.headers.accept && request.headers.accept.includes('application/json'));
      if (!isApi) {
        response.redirect('/login');
        return false;
      }
      response.status(401).json({ message: 'Authentication required.' });
      return false;
    }

    // SUPER_ADMIN has full access
    if (user.role === 'SUPER_ADMIN' || user.isSuperAdmin) {
      return true;
    }

    // Check if user satisfies required permissions
    const hasAll = requiredPermissions.every((perm) => Boolean(user[perm]));
    if (!hasAll) {
      const isApi =
        request.url.startsWith('/api') ||
        (request.headers.accept && request.headers.accept.includes('application/json'));
      if (!isApi) {
        response.redirect('/403');
        return false;
      }
      response.status(403).json({
        message: `Insufficient permissions. Required: [${requiredPermissions.join(', ')}]`,
      });
      return false;
    }

    return true;
  }
}
