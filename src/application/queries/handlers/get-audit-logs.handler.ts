import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetAuditLogsQuery } from '../impl/get-audit-logs.query';
import {
  AUDIT_LOG_REPOSITORY_TOKEN,
  AuditLogFilter,
  IAuditLogRepository,
} from '@domain/index';
import { GetAuditLogsResponseDto } from '../../dtos/audit-log.dto';

@QueryHandler(GetAuditLogsQuery)
export class GetAuditLogsHandler
  implements IQueryHandler<GetAuditLogsQuery, GetAuditLogsResponseDto>
{
  constructor(
    @Inject(AUDIT_LOG_REPOSITORY_TOKEN)
    private readonly auditRepo: IAuditLogRepository,
  ) {}

  async execute(query: GetAuditLogsQuery): Promise<GetAuditLogsResponseDto> {
    const filter: AuditLogFilter = {
      action: query.action,
      entityType: query.entityType,
      search: query.search,
      page: query.page,
      limit: query.limit,
    };

    if (query.days && query.days > 0) {
      const fromDate = new Date();
      if (query.days === 1) {
        // Today
        fromDate.setHours(0, 0, 0, 0);
      } else {
        fromDate.setDate(fromDate.getDate() - query.days);
      }
      filter.fromDate = fromDate;
    }

    const [filteredResult, stats] = await Promise.all([
      this.auditRepo.findFiltered(query.companyId, filter),
      this.auditRepo.getStats(query.companyId),
    ]);

    const page = Math.max(1, query.page || 1);
    const pageSize = Math.max(1, query.limit || 20);
    const totalPages = Math.max(1, Math.ceil(filteredResult.total / pageSize));

    return {
      logs: filteredResult.logs.map((log) => ({
        id: log.id,
        companyId: log.companyId,
        userId: log.userId,
        userName: log.userName,
        userRole: log.userRole,
        action: log.action,
        entityType: log.entityType,
        entityId: log.entityId,
        entityName: log.entityName,
        details: log.details,
        ipAddress: log.ipAddress,
        userAgent: log.userAgent,
        createdDate: log.createdDate,
      })),
      stats,
      totalCount: filteredResult.total,
      page,
      pageSize,
      totalPages,
    };
  }
}
