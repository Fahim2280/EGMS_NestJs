import {
  Controller,
  Get,
  Inject,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { Request, Response } from 'express';
import { JwtAuthGuard } from '@infrastructure/auth/jwt-auth.guard';
import { RolesGuard } from '@infrastructure/auth/roles.guard';
import { Roles } from '@infrastructure/auth/roles.decorator';
import { GetAuditLogsQuery } from '@application/queries/impl/get-audit-logs.query';
import {
  AUDIT_LOG_REPOSITORY_TOKEN,
  IAuditLogRepository,
  EMPLOYEE_REPOSITORY_TOKEN,
  IEmployeeRepository,
} from '@domain/index';
import { translateAuditDetails } from '@infrastructure/i18n/i18n.service';

@Controller('audit-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN')
export class AuditLogController {
  constructor(
    private readonly queryBus: QueryBus,
    @Inject(AUDIT_LOG_REPOSITORY_TOKEN)
    private readonly auditRepo: IAuditLogRepository,
    @Inject(EMPLOYEE_REPOSITORY_TOKEN)
    private readonly employeeRepo: IEmployeeRepository,
  ) {}

  @Get()
  async renderDashboard(
    @Req() req: Request,
    @Res() res: Response,
    @Query('action') action?: string,
    @Query('entityType') entityType?: string,
    @Query('search') search?: string,
    @Query('days') days?: string,
    @Query('page') page?: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
  ) {
    const user = (req as any).user;
    const pageNum = Math.max(1, parseInt(page || '1', 10) || 1);
    const daysNum = days ? parseInt(days, 10) : undefined;
    const isBn = (req as any).lang === 'bn' || req.cookies?.lang === 'bn';

    const parsedFrom = fromDate ? new Date(fromDate) : undefined;
    const parsedTo = toDate ? new Date(toDate) : undefined;

    const result = await this.queryBus.execute(
      new GetAuditLogsQuery(
        user.companyId,
        action && action !== 'ALL' ? action : undefined,
        entityType && entityType !== 'ALL' ? entityType : undefined,
        search && search.trim() ? search.trim() : undefined,
        daysNum,
        pageNum,
        25,
        parsedFrom,
        parsedTo,
      ),
    );

    // Generate pagination links helper data
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, result.page - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(result.totalPages, startPage + maxVisiblePages - 1);
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    for (let p = startPage; p <= endPage; p++) {
      pages.push({
        number: p,
        isCurrent: p === result.page,
      });
    }

    return res.render('audit-logs/index', {
      title: isBn
        ? 'অডিট লগ ও নিরাপত্তা কার্যক্রম - EGMS Portal'
        : 'Audit Log & Security Activity - EGMS Portal',
      activeNav: 'audit-logs',
      user,
      currentUser: user,
      isSuperAdmin: true,
      logs: result.logs,
      stats: result.stats,
      totalCount: result.totalCount,
      page: result.page,
      totalPages: result.totalPages,
      hasMultiplePages: result.totalPages > 1,
      hasPrevPage: result.page > 1,
      hasNextPage: result.page < result.totalPages,
      prevPage: result.page - 1,
      nextPage: result.page + 1,
      pages,
      selectedAction: action || 'ALL',
      selectedEntityType: entityType || 'ALL',
      selectedDays: days || '',
      search: search || '',
      fromDate: fromDate || '',
      toDate: toDate || '',
    });
  }

  @Get('export')
  async exportCsv(
    @Req() req: Request,
    @Res() res: Response,
    @Query('action') action?: string,
    @Query('entityType') entityType?: string,
    @Query('search') search?: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
  ) {
    const user = (req as any).user;

    const parsedFrom = fromDate ? new Date(fromDate) : undefined;
    const parsedTo = toDate ? new Date(toDate) : undefined;

    const logs = await this.auditRepo.findAllForExport(user.companyId, {
      action: action && action !== 'ALL' ? action : undefined,
      entityType: entityType && entityType !== 'ALL' ? entityType : undefined,
      search: search && search.trim() ? search.trim() : undefined,
      fromDate: parsedFrom,
      toDate: parsedTo,
    });

    const employeeMap = new Map<string, string>();
    const hasEmployeeLogs = logs.some((l) => l.entityType === 'EMPLOYEE');
    if (hasEmployeeLogs) {
      try {
        const allEmployees = await this.employeeRepo.findByCompanyId(
          user.companyId,
        );
        for (const emp of allEmployees) {
          employeeMap.set(emp.id, emp.name);
        }
      } catch {}
    }

    const escapeCsv = (val: any) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const header = [
      'Timestamp',
      'User Name',
      'User Role',
      'Action',
      'Entity Type',
      'Entity ID',
      'Entity Name',
      'Details',
      'IP Address',
      'User Agent',
    ].join(',');

    const rows = logs.map((l) => {
      let entityName = l.entityName;
      let details = l.details;
      if (l.entityType === 'EMPLOYEE' && l.entityId) {
        const empName = employeeMap.get(l.entityId);
        if (empName) {
          if (
            !entityName ||
            entityName.startsWith('#') ||
            entityName === l.entityId
          ) {
            entityName = empName;
          }
          if (details) {
            details = details
              .split(`employee #${l.entityId}`)
              .join(`employee ${empName}`)
              .split(`employee ${l.entityId}`)
              .join(`employee ${empName}`)
              .split(`#${l.entityId}`)
              .join(empName);
          }
        }
      }

      return [
        escapeCsv(l.createdDate ? new Date(l.createdDate).toISOString() : ''),
        escapeCsv(l.userName),
        escapeCsv(l.userRole),
        escapeCsv(l.action),
        escapeCsv(l.entityType),
        escapeCsv(l.entityId),
        escapeCsv(entityName),
        escapeCsv(details),
        escapeCsv(l.ipAddress),
        escapeCsv(l.userAgent),
      ].join(',');
    });

    const csvContent = [header, ...rows].join('\r\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="audit-logs-${new Date().toISOString().slice(0, 10)}.csv"`,
    );
    return res.send(csvContent);
  }

  @Get('notifications/recent')
  async getRecentNotifications(
    @Req() req: Request,
    @Res() res: Response,
    @Query('since') since?: string,
  ) {
    const user = (req as any).user;
    if (!user || user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // Fetch the most recent audit logs for the company
    const logs = await this.auditRepo.findAllForExport(user.companyId, {});

    // Sort descending by createdDate
    logs.sort(
      (a, b) =>
        new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime(),
    );
    const recentLogs = logs.slice(0, 10);

    // Resolve employee names
    const employeeMap = new Map<string, string>();
    const hasEmployeeLogs = recentLogs.some((l) => l.entityType === 'EMPLOYEE');
    if (hasEmployeeLogs) {
      try {
        const allEmployees = await this.employeeRepo.findByCompanyId(
          user.companyId,
        );
        for (const emp of allEmployees) {
          employeeMap.set(emp.id, emp.name);
        }
      } catch {}
    }

    const sinceDate = since ? new Date(since) : null;
    let unreadCount = 0;
    if (sinceDate && !isNaN(sinceDate.getTime())) {
      unreadCount = logs.filter(
        (l) => new Date(l.createdDate).getTime() > sinceDate.getTime(),
      ).length;
    } else {
      unreadCount = Math.min(recentLogs.length, 5);
    }

    const formattedLogs = recentLogs.map((l) => {
      let entityName = l.entityName;
      let details = l.details;
      if (l.entityType === 'EMPLOYEE' && l.entityId) {
        const empName = employeeMap.get(l.entityId);
        if (empName) {
          if (
            !entityName ||
            entityName.startsWith('#') ||
            entityName === l.entityId
          ) {
            entityName = empName;
          }
          if (details) {
            details = details
              .split(`employee #${l.entityId}`)
              .join(`employee ${empName}`)
              .split(`employee ${l.entityId}`)
              .join(`employee ${empName}`)
              .split(`#${l.entityId}`)
              .join(empName);
          }
        }
      }

      return {
        id: l.id,
        userName: l.userName,
        userRole: l.userRole,
        action: l.action,
        entityType: l.entityType,
        entityName,
        details,
        detailsBn: translateAuditDetails(details || '', 'bn'),
        createdDate: l.createdDate,
      };
    });

    return res.json({
      unreadCount,
      logs: formattedLogs,
    });
  }
}
