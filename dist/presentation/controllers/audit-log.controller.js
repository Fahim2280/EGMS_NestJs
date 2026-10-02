"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditLogController = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const jwt_auth_guard_1 = require("../../infrastructure/auth/jwt-auth.guard");
const roles_guard_1 = require("../../infrastructure/auth/roles.guard");
const roles_decorator_1 = require("../../infrastructure/auth/roles.decorator");
const get_audit_logs_query_1 = require("../../application/queries/impl/get-audit-logs.query");
const index_1 = require("../../domain/index");
const i18n_service_1 = require("../../infrastructure/i18n/i18n.service");
let AuditLogController = class AuditLogController {
    queryBus;
    auditRepo;
    employeeRepo;
    constructor(queryBus, auditRepo, employeeRepo) {
        this.queryBus = queryBus;
        this.auditRepo = auditRepo;
        this.employeeRepo = employeeRepo;
    }
    async renderDashboard(req, res, action, entityType, search, days, page, fromDate, toDate) {
        const user = req.user;
        const pageNum = Math.max(1, parseInt(page || '1', 10) || 1);
        const daysNum = days ? parseInt(days, 10) : undefined;
        const isBn = req.lang === 'bn' || req.cookies?.lang === 'bn';
        const parsedFrom = fromDate ? new Date(fromDate) : undefined;
        const parsedTo = toDate ? new Date(toDate) : undefined;
        const result = await this.queryBus.execute(new get_audit_logs_query_1.GetAuditLogsQuery(user.companyId, action && action !== 'ALL' ? action : undefined, entityType && entityType !== 'ALL' ? entityType : undefined, search && search.trim() ? search.trim() : undefined, daysNum, pageNum, 25, parsedFrom, parsedTo));
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
    async exportCsv(req, res, action, entityType, search, fromDate, toDate) {
        const user = req.user;
        const parsedFrom = fromDate ? new Date(fromDate) : undefined;
        const parsedTo = toDate ? new Date(toDate) : undefined;
        const logs = await this.auditRepo.findAllForExport(user.companyId, {
            action: action && action !== 'ALL' ? action : undefined,
            entityType: entityType && entityType !== 'ALL' ? entityType : undefined,
            search: search && search.trim() ? search.trim() : undefined,
            fromDate: parsedFrom,
            toDate: parsedTo,
        });
        const employeeMap = new Map();
        const hasEmployeeLogs = logs.some((l) => l.entityType === 'EMPLOYEE');
        if (hasEmployeeLogs) {
            try {
                const allEmployees = await this.employeeRepo.findByCompanyId(user.companyId);
                for (const emp of allEmployees) {
                    employeeMap.set(emp.id, emp.name);
                }
            }
            catch { }
        }
        const escapeCsv = (val) => {
            if (val === null || val === undefined)
                return '""';
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
                    if (!entityName ||
                        entityName.startsWith('#') ||
                        entityName === l.entityId) {
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
        res.setHeader('Content-Disposition', `attachment; filename="audit-logs-${new Date().toISOString().slice(0, 10)}.csv"`);
        return res.send(csvContent);
    }
    async getRecentNotifications(req, res, since) {
        const user = req.user;
        if (!user || user.role !== 'SUPER_ADMIN') {
            return res.status(403).json({ error: 'Forbidden' });
        }
        const logs = await this.auditRepo.findAllForExport(user.companyId, {});
        logs.sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime());
        const recentLogs = logs.slice(0, 10);
        const employeeMap = new Map();
        const hasEmployeeLogs = recentLogs.some((l) => l.entityType === 'EMPLOYEE');
        if (hasEmployeeLogs) {
            try {
                const allEmployees = await this.employeeRepo.findByCompanyId(user.companyId);
                for (const emp of allEmployees) {
                    employeeMap.set(emp.id, emp.name);
                }
            }
            catch { }
        }
        const sinceDate = since ? new Date(since) : null;
        let unreadCount = 0;
        if (sinceDate && !isNaN(sinceDate.getTime())) {
            unreadCount = logs.filter((l) => new Date(l.createdDate).getTime() > sinceDate.getTime()).length;
        }
        else {
            unreadCount = Math.min(recentLogs.length, 5);
        }
        const formattedLogs = recentLogs.map((l) => {
            let entityName = l.entityName;
            let details = l.details;
            if (l.entityType === 'EMPLOYEE' && l.entityId) {
                const empName = employeeMap.get(l.entityId);
                if (empName) {
                    if (!entityName ||
                        entityName.startsWith('#') ||
                        entityName === l.entityId) {
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
                detailsBn: (0, i18n_service_1.translateAuditDetails)(details || '', 'bn'),
                createdDate: l.createdDate,
            };
        });
        return res.json({
            unreadCount,
            logs: formattedLogs,
        });
    }
};
exports.AuditLogController = AuditLogController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __param(2, (0, common_1.Query)('action')),
    __param(3, (0, common_1.Query)('entityType')),
    __param(4, (0, common_1.Query)('search')),
    __param(5, (0, common_1.Query)('days')),
    __param(6, (0, common_1.Query)('page')),
    __param(7, (0, common_1.Query)('fromDate')),
    __param(8, (0, common_1.Query)('toDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String, String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], AuditLogController.prototype, "renderDashboard", null);
__decorate([
    (0, common_1.Get)('export'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __param(2, (0, common_1.Query)('action')),
    __param(3, (0, common_1.Query)('entityType')),
    __param(4, (0, common_1.Query)('search')),
    __param(5, (0, common_1.Query)('fromDate')),
    __param(6, (0, common_1.Query)('toDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], AuditLogController.prototype, "exportCsv", null);
__decorate([
    (0, common_1.Get)('notifications/recent'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __param(2, (0, common_1.Query)('since')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String]),
    __metadata("design:returntype", Promise)
], AuditLogController.prototype, "getRecentNotifications", null);
exports.AuditLogController = AuditLogController = __decorate([
    (0, common_1.Controller)('audit-logs'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('SUPER_ADMIN'),
    __param(1, (0, common_1.Inject)(index_1.AUDIT_LOG_REPOSITORY_TOKEN)),
    __param(2, (0, common_1.Inject)(index_1.EMPLOYEE_REPOSITORY_TOKEN)),
    __metadata("design:paramtypes", [cqrs_1.QueryBus, Object, Object])
], AuditLogController);
//# sourceMappingURL=audit-log.controller.js.map