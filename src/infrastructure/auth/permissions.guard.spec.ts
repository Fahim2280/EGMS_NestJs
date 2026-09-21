import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';
import { PermissionsGuard } from './permissions.guard';
import { PERMISSIONS_KEY } from './permissions.decorator';

describe('PermissionsGuard', () => {
  let guard: PermissionsGuard;
  let reflector: jest.Mocked<Reflector>;

  beforeEach(() => {
    reflector = {
      getAllAndOverride: jest.fn(),
    } as any;
    guard = new PermissionsGuard(reflector);
  });

  const createMockContext = (user: any, url = '/customers/new', accept = 'text/html'): { context: ExecutionContext; res: any } => {
    const res = {
      redirect: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const req = {
      user,
      url,
      headers: { accept },
    };
    const context = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => req,
        getResponse: () => res,
      }),
    } as unknown as ExecutionContext;

    return { context, res };
  };

  it('should allow access if no permissions are required', () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);
    const { context } = createMockContext(null);

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should redirect unauthenticated HTML user to /login', () => {
    reflector.getAllAndOverride.mockReturnValue(['canCreate']);
    const { context, res } = createMockContext(null, '/customers/new', 'text/html');

    const result = guard.canActivate(context);
    expect(result).toBe(false);
    expect(res.redirect).toHaveBeenCalledWith('/login');
  });

  it('should return 401 for unauthenticated API requests', () => {
    reflector.getAllAndOverride.mockReturnValue(['canCreate']);
    const { context, res } = createMockContext(null, '/api/customers', 'application/json');

    const result = guard.canActivate(context);
    expect(result).toBe(false);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('should always allow SUPER_ADMIN even if permission flags are missing', () => {
    reflector.getAllAndOverride.mockReturnValue(['canDelete']);
    const { context } = createMockContext({ role: 'SUPER_ADMIN' });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should allow employee who has the required permission', () => {
    reflector.getAllAndOverride.mockReturnValue(['canCreate']);
    const { context } = createMockContext({ role: 'GENERAL', canCreate: true });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should redirect employee without required permission to /403', () => {
    reflector.getAllAndOverride.mockReturnValue(['canDelete']);
    const { context, res } = createMockContext({ role: 'GENERAL', canDelete: false }, '/customers/1/delete', 'text/html');

    const result = guard.canActivate(context);
    expect(result).toBe(false);
    expect(res.redirect).toHaveBeenCalledWith('/403');
  });

  it('should return 403 json for API employee without required permission', () => {
    reflector.getAllAndOverride.mockReturnValue(['canEdit']);
    const { context, res } = createMockContext({ role: 'GENERAL', canEdit: false }, '/api/customers/1', 'application/json');

    const result = guard.canActivate(context);
    expect(result).toBe(false);
    expect(res.status).toHaveBeenCalledWith(403);
  });
});
