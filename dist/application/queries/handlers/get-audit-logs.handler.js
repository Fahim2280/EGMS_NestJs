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
exports.GetAuditLogsHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const get_audit_logs_query_1 = require("../impl/get-audit-logs.query");
const index_1 = require("../../../domain/index");
let GetAuditLogsHandler = class GetAuditLogsHandler {
    auditRepo;
    employeeRepo;
    customerRepo;
    constructor(auditRepo, employeeRepo, customerRepo) {
        this.auditRepo = auditRepo;
        this.employeeRepo = employeeRepo;
        this.customerRepo = customerRepo;
    }
    async execute(query) {
        const filter = {
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
        }
        else if (query.days && query.days > 0) {
            const fromDate = new Date();
            if (query.days === 1) {
                fromDate.setHours(0, 0, 0, 0);
            }
            else {
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
        const employeeIdsToResolve = new Set();
        const customerIdsToResolve = new Set();
        for (const log of filteredResult.logs) {
            if (log.entityType === 'EMPLOYEE' && log.entityId) {
                employeeIdsToResolve.add(log.entityId);
            }
            if ((log.entityType === 'CUSTOMER' || log.entityType === 'ELECTRIC_BILL') && log.entityId) {
                customerIdsToResolve.add(log.entityId);
            }
            if (log.details) {
                const matches = log.details.match(/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/g);
                if (matches) {
                    matches.forEach((m) => {
                        if (log.entityType === 'EMPLOYEE') {
                            employeeIdsToResolve.add(m);
                        }
                        else {
                            customerIdsToResolve.add(m);
                        }
                    });
                }
            }
        }
        const employeeMap = new Map();
        if (employeeIdsToResolve.size > 0) {
            try {
                const allEmployees = await this.employeeRepo.findByCompanyId(query.companyId);
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
            }
            catch {
            }
        }
        const customerMap = new Map();
        if (customerIdsToResolve.size > 0) {
            try {
                const allCustomers = await this.customerRepo.findByCompanyId(query.companyId);
                for (const cust of allCustomers) {
                    const display = cust.customerCode ? `${cust.name} (${cust.customerCode})` : cust.name;
                    customerMap.set(cust.id, display);
                }
            }
            catch {
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
                    const resolvedName = (empId ? employeeMap.get(empId) : null) ||
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
                }
                else if (log.entityType === 'CUSTOMER' || log.entityType === 'ELECTRIC_BILL') {
                    if (log.entityId && customerMap.has(log.entityId)) {
                        const resolvedCust = customerMap.get(log.entityId);
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
};
exports.GetAuditLogsHandler = GetAuditLogsHandler;
exports.GetAuditLogsHandler = GetAuditLogsHandler = __decorate([
    (0, cqrs_1.QueryHandler)(get_audit_logs_query_1.GetAuditLogsQuery),
    __param(0, (0, common_1.Inject)(index_1.AUDIT_LOG_REPOSITORY_TOKEN)),
    __param(1, (0, common_1.Inject)(index_1.EMPLOYEE_REPOSITORY_TOKEN)),
    __param(2, (0, common_1.Inject)(index_1.CUSTOMER_REPOSITORY_TOKEN)),
    __metadata("design:paramtypes", [Object, Object, Object])
], GetAuditLogsHandler);
//# sourceMappingURL=get-audit-logs.handler.js.map