export type PermissionType = 'canCreate' | 'canEdit' | 'canDelete' | 'canView';
export declare const PERMISSIONS_KEY = "permissions";
export declare const RequirePermissions: (...permissions: PermissionType[]) => import("@nestjs/common").CustomDecorator<string>;
