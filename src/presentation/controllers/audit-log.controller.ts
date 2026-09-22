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
} from '@domain/index';

@Controller('audit-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN')
export class AuditLogController {
  constructor(
    private readonly queryBus: QueryBus,
    @Inject(AUDIT_LOG_REPOSITORY_TOKEN)
    private readonly auditRepo: IAuditLogRepository,
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
  ) {
    const user = (req as any).user;
    const pageNum = Math.max(1, parseInt(page || '1', 10) || 1);
    const daysNum = days ? parseInt(days, 10) : undefined;

    const result = await this.queryBus.execute(
      new GetAuditLogsQuery(
        user.companyId,
        action && action !== 'ALL' ? action : undefined,
        entityType && entityType !== 'ALL' ? entityType : undefined,
        search && search.trim() ? search.trim() : undefined,
        daysNum,
        pageNum,
        25,
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
      title: 'Audit Log & Security Activity - EGMS Portal',
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
    });
  }

  @Get('export')
  async exportCsv(
    @Req() req: Request,
    @Res() res: Response,
    @Query('action') action?: string,
    @Query('entityType') entityType?: string,
    @Query('search') search?: string,
  ) {
    const user = (req as any).user;

    const logs = await this.auditRepo.findAllForExport(user.companyId, {
      action: action && action !== 'ALL' ? action : undefined,
      entityType: entityType && entityType !== 'ALL' ? entityType : undefined,
      search: search && search.trim() ? search.trim() : undefined,
    });

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

    const rows = logs.map((l) =>
      [
        escapeCsv(l.createdDate ? new Date(l.createdDate).toISOString() : ''),
        escapeCsv(l.userName),
        escapeCsv(l.userRole),
        escapeCsv(l.action),
        escapeCsv(l.entityType),
        escapeCsv(l.entityId),
        escapeCsv(l.entityName),
        escapeCsv(l.details),
        escapeCsv(l.ipAddress),
        escapeCsv(l.userAgent),
      ].join(','),
    );

    const csvContent = [header, ...rows].join('\r\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="audit-logs-${new Date().toISOString().slice(0, 10)}.csv"`,
    );
    return res.send(csvContent);
  }
}
