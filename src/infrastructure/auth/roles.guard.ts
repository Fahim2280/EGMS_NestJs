import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY, RoleType } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<RoleType[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const user = request.user;

    if (!user || (!user.role && !user.isSuperAdmin)) {
      const isApi = request.url.startsWith('/api') ||
        (request.headers.accept && request.headers.accept.includes('application/json'));
      if (!isApi) {
        response.redirect('/login');
        return false;
      }
      response.status(401).json({ message: 'Authentication required.' });
      return false;
    }

    const isSuperAdmin =
      user.role === 'SUPER_ADMIN' ||
      user.isSuperAdmin === true ||
      user.role?.toUpperCase() === 'SUPER_ADMIN';

    const hasRole =
      (isSuperAdmin && requiredRoles.includes('SUPER_ADMIN')) ||
      (user.role && requiredRoles.includes(user.role)) ||
      (user.role && requiredRoles.includes(user.role.toUpperCase()));

    if (!hasRole) {
      const isApi = request.url.startsWith('/api') ||
        (request.headers.accept && request.headers.accept.includes('application/json'));
      if (!isApi) {
        response.redirect('/403');
        return false;
      }
      response.status(403).json({
        message: `Insufficient privileges. Required: [${requiredRoles.join(', ')}], Current: ${user.role || 'GENERAL'}`,
      });
      return false;
    }

    return true;
  }
}
