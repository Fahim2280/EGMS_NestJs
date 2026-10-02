export declare class AuditLogOrmEntity {
    id: string;
    companyId: string;
    userId: string;
    userName: string;
    userRole: string;
    action: string;
    entityType: string;
    entityId?: string | null;
    entityName?: string | null;
    details?: string | null;
    ipAddress?: string | null;
    userAgent?: string | null;
    createdDate: Date;
}
