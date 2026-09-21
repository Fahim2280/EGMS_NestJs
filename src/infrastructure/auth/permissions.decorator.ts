import { SetMetadata } from '@nestjs/common';

export type PermissionType = 'canCreate' | 'canEdit' | 'canDelete' | 'canView';

export const PERMISSIONS_KEY = 'permissions';
export const RequirePermissions = (...permissions: PermissionType[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
