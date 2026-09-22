import { AuditLog } from '../entities/audit-log.entity';

export const AUDIT_LOG_REPOSITORY_TOKEN = 'AUDIT_LOG_REPOSITORY_TOKEN';

export interface AuditLogFilter {
  action?: string;
  entityType?: string;
  userId?: string;
  search?: string;
  fromDate?: Date;
  toDate?: Date;
  page?: number;
  limit?: number;
}

export interface AuditLogStats {
  totalCount: number;
  todayCount: number;
  authCount: number;
  criticalCount: number;
}

export interface IAuditLogRepository {
  save(log: AuditLog): Promise<AuditLog>;
  findFiltered(
    companyId: string,
    filter: AuditLogFilter,
  ): Promise<{ logs: AuditLog[]; total: number }>;
  getStats(companyId: string): Promise<AuditLogStats>;
  findAllForExport(companyId: string, filter: AuditLogFilter): Promise<AuditLog[]>;
}
