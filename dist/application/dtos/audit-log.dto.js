"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetAuditLogsResponseDto = exports.AuditLogStatsDto = exports.AuditLogResponseDto = void 0;
class AuditLogResponseDto {
    id;
    companyId;
    userId;
    userName;
    userRole;
    action;
    entityType;
    entityId;
    entityName;
    details;
    ipAddress;
    userAgent;
    createdDate;
}
exports.AuditLogResponseDto = AuditLogResponseDto;
class AuditLogStatsDto {
    totalCount;
    todayCount;
    authCount;
    criticalCount;
}
exports.AuditLogStatsDto = AuditLogStatsDto;
class GetAuditLogsResponseDto {
    logs;
    stats;
    totalCount;
    page;
    pageSize;
    totalPages;
}
exports.GetAuditLogsResponseDto = GetAuditLogsResponseDto;
//# sourceMappingURL=audit-log.dto.js.map