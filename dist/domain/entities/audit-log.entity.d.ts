export type AuditAction = 'LOGIN' | 'LOGOUT' | 'PASSWORD_RESET' | 'CREATE' | 'UPDATE' | 'DELETE' | 'RESTORE' | 'PERMISSIONS_UPDATE';
export type AuditEntityType = 'AUTH' | 'CUSTOMER' | 'ELECTRIC_BILL' | 'GARAGE' | 'EMPLOYEE' | 'COMPANY' | 'GUARANTOR';
export interface CreateAuditLogProps {
    id: string;
    companyId: string;
    userId: string;
    userName: string;
    userRole: string;
    action: AuditAction | string;
    entityType: AuditEntityType | string;
    entityId?: string | null;
    entityName?: string | null;
    details?: string | null;
    ipAddress?: string | null;
    userAgent?: string | null;
    createdDate?: Date;
}
export declare class AuditLog {
    readonly id: string;
    readonly companyId: string;
    readonly userId: string;
    readonly userName: string;
    readonly userRole: string;
    readonly action: string;
    readonly entityType: string;
    readonly entityId?: string | null;
    readonly entityName?: string | null;
    readonly details?: string | null;
    readonly ipAddress?: string | null;
    readonly userAgent?: string | null;
    readonly createdDate: Date;
    constructor(props: CreateAuditLogProps);
    static create(props: CreateAuditLogProps): AuditLog;
}
