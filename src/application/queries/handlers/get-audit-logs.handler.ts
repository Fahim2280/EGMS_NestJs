import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetAuditLogsQuery } from '../impl/get-audit-logs.query';
import {
  AUDIT_LOG_REPOSITORY_TOKEN,
  AuditLogFilter,
  IAuditLogRepository,
  EMPLOYEE_REPOSITORY_TOKEN,
  IEmployeeRepository,
  CUSTOMER_REPOSITORY_TOKEN,
  ICustomerRepository,
} from '@domain/index';
import { GetAuditLogsResponseDto } from '../../dtos/audit-log.dto';

@QueryHandler(GetAuditLogsQuery)
export class GetAuditLogsHandler
  implements IQueryHandler<GetAuditLogsQuery, GetAuditLogsResponseDto>
{
  constructor(
    @Inject(AUDIT_LOG_REPOSITORY_TOKEN)
    private readonly auditRepo: IAuditLogRepository,
    @Inject(EMPLOYEE_REPOSITORY_TOKEN)
    private readonly employeeRepo: IEmployeeRepository,
    @Inject(CUSTOMER_REPOSITORY_TOKEN)
    private readonly customerRepo: ICustomerRepository,
  ) {}

  async execute(query: GetAuditLogsQuery): Promise<GetAuditLogsResponseDto> {
    const filter: AuditLogFilter = {
      action: query.action,
      entityType: query.entityType,
      search: query.search,
      page: query.page,
      limit: query.limit,
    };

    if (query.fromDate) {
      const from = new Date(query.fromDate);
      from.setHours(0, 0, 0, 0);
      filter.fromDate = from;
    } else if (query.days && query.days > 0) {
      const fromDate = new Date();
      if (query.days === 1) {
        // Today
        fromDate.setHours(0, 0, 0, 0);
      } else {
        fromDate.setDate(fromDate.getDate() - query.days);
      }
      filter.fromDate = fromDate;
    }

    if (query.toDate) {
      const to = new Date(query.toDate);
      to.setHours(23, 59, 59, 999);
      filter.toDate = to;
    }

    const [filteredResult, stats] = await Promise.all([
      this.auditRepo.findFiltered(query.companyId, filter),
      this.auditRepo.getStats(query.companyId),
    ]);

    // Build map of employeeId -> employeeName
    const employeeIdsToResolve = new Set<string>();
    const customerIdsToResolve = new Set<string>();

    for (const log of filteredResult.logs) {
      if (log.entityType === 'EMPLOYEE' && log.entityId) {
        employeeIdsToResolve.add(log.entityId);
      }
      if ((log.entityType === 'CUSTOMER' || log.entityType === 'ELECTRIC_BILL') && log.entityId) {
        customerIdsToResolve.add(log.entityId);
      }
      if (log.details) {
        const matches = log.details.match(
          /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/g,
        );
        if (matches) {
          matches.forEach((m) => {
            if (log.entityType === 'EMPLOYEE') {
              employeeIdsToResolve.add(m);
            } else {
              customerIdsToResolve.add(m);
            }
          });
        }
      }
    }

    const employeeMap = new Map<string, string>();
    if (employeeIdsToResolve.size > 0) {
      try {
        const allEmployees = await this.employeeRepo.findByCompanyId(
          query.companyId,
        );
        for (const emp of allEmployees) {
          employeeMap.set(emp.id, emp.name);
        }
        for (const empId of employeeIdsToResolve) {
          if (!employeeMap.has(empId)) {
            const emp = await this.employeeRepo.findById(empId).catch(() => null);
            if (emp) {
              employeeMap.set(emp.id, emp.name);
            }
          }
        }
      } catch {
        // Fallback silently if lookup encounters an error
      }
    }

    const customerMap = new Map<string, string>();
    if (customerIdsToResolve.size > 0) {
      try {
        const allCustomers = await this.customerRepo.findByCompanyId(
          query.companyId,
        );
        for (const cust of allCustomers) {
          const display = cust.customerCode ? `${cust.name} (${cust.customerCode})` : cust.name;
          customerMap.set(cust.id, display);
        }
      } catch {
        // Fallback silently if lookup encounters an error
      }
    }

    const page = Math.max(1, query.page || 1);
    const pageSize = Math.max(1, query.limit || 20);
    const totalPages = Math.max(1, Math.ceil(filteredResult.total / pageSize));

    return {
      logs: filteredResult.logs.map((log) => {
        let entityName = log.entityName;
        let details = log.details;

        if (log.entityType === 'EMPLOYEE') {
          const empId = log.entityId;
          const resolvedName =
            (empId ? employeeMap.get(empId) : null) ||
            (entityName && !entityName.startsWith('#') && entityName !== empId
              ? entityName
              : null);

          if (resolvedName) {
            entityName = resolvedName;
          }

          if (details && empId) {
            const nameToDisplay = resolvedName || entityName;
            if (nameToDisplay && !nameToDisplay.startsWith('#')) {
              details = details
                .split(`employee #${empId}`).join(`employee ${nameToDisplay}`)
                .split(`employee ${empId}`).join(`employee ${nameToDisplay}`)
                .split(`#${empId}`).join(nameToDisplay);
            }
          }

          if (details) {
            for (const [id, name] of employeeMap.entries()) {
              if (details.includes(id)) {
                details = details
                  .split(`employee #${id}`).join(`employee ${name}`)
                  .split(`employee ${id}`).join(`employee ${name}`)
                  .split(`#${id}`).join(name)
                  .split(id).join(name);
              }
            }
          }
        } else if (log.entityType === 'CUSTOMER' || log.entityType === 'ELECTRIC_BILL') {
          if (log.entityId && customerMap.has(log.entityId)) {
            const resolvedCust = customerMap.get(log.entityId)!;
            if (!entityName || entityName.startsWith('#') || entityName === log.entityId) {
              entityName = resolvedCust;
            }
          }
          if (details) {
            for (const [id, display] of customerMap.entries()) {
              if (details.includes(id)) {
                details = details
                  .split(`customer ${id}`).join(`customer ${display}`)
                  .split(id).join(display);
              }
            }
          }
        }

        return {
          id: log.id,
          companyId: log.companyId,
          userId: log.userId,
          userName: log.userName,
          userRole: log.userRole,
          action: log.action,
          entityType: log.entityType,
          entityId: log.entityId,
          entityName,
          details,
          ipAddress: log.ipAddress,
          userAgent: log.userAgent,
          createdDate: log.createdDate,
        };
      }),
      stats,
      totalCount: filteredResult.total,
      page,
      pageSize,
      totalPages,
    };
  }
}
