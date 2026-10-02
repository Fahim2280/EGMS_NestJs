export type RoleType = 'SUPER_ADMIN' | 'GENERAL' | string;
export declare const ROLES_KEY = "roles";
export declare const Roles: (...roles: RoleType[]) => import("@nestjs/common").CustomDecorator<string>;
