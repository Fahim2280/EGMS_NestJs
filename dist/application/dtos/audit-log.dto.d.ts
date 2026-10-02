export declare class AuditLogResponseDto {
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
export declare class AuditLogStatsDto {
    totalCount: number;
    todayCount: number;
    authCount: number;
    criticalCount: number;
}
export declare class GetAuditLogsResponseDto {
    logs: AuditLogResponseDto[];
    stats: AuditLogStatsDto;
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
}
