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
var AuditLogService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditLogService = void 0;
const common_1 = require("@nestjs/common");
const uuid_1 = require("uuid");
const index_1 = require("../../domain/index");
let AuditLogService = AuditLogService_1 = class AuditLogService {
    auditRepo;
    employeeRepo;
    logger = new common_1.Logger(AuditLogService_1.name);
    constructor(auditRepo, employeeRepo) {
        this.auditRepo = auditRepo;
        this.employeeRepo = employeeRepo;
    }
    async record(params) {
        try {
            let ip = params.ipAddress;
            let ua = params.userAgent;
            if (params.req) {
                ip =
                    ip ||
                        params.req.headers?.['x-forwarded-for']?.split(',')[0]?.trim() ||
                        params.req.ip ||
                        params.req.socket?.remoteAddress ||
                        '127.0.0.1';
                ua = ua || params.req.headers?.['user-agent'];
            }
            if (ua && ua.length > 250) {
                ua = ua.substring(0, 250) + '...';
            }
            let entityName = params.entityName || null;
            let details = params.details || null;
            if (params.entityType === 'EMPLOYEE' && params.entityId) {
                if (!entityName || entityName.startsWith('#') || entityName === params.entityId) {
                    try {
                        const emp = await this.employeeRepo.findById(params.entityId);
                        if (emp?.name) {
                            entityName = emp.name;
                        }
                    }
                    catch { }
                }
                if (entityName && details) {
                    details = details
                        .split(`employee #${params.entityId}`).join(`employee ${entityName}`)
                        .split(`employee ${params.entityId}`).join(`employee ${entityName}`)
                        .split(`#${params.entityId}`).join(entityName);
                }
            }
            const log = index_1.AuditLog.create({
                id: (0, uuid_1.v4)(),
                companyId: params.companyId,
                userId: params.userId,
                userName: params.userName || 'System',
                userRole: params.userRole || 'GENERAL',
                action: params.action,
                entityType: params.entityType,
                entityId: params.entityId || null,
                entityName: entityName,
                details: details,
                ipAddress: ip || null,
                userAgent: ua || null,
                createdDate: new Date(),
            });
            await this.auditRepo.save(log);
        }
        catch (err) {
            this.logger.warn(`Failed to record audit log: ${err.message}`);
        }
    }
};
exports.AuditLogService = AuditLogService;
exports.AuditLogService = AuditLogService = AuditLogService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(index_1.AUDIT_LOG_REPOSITORY_TOKEN)),
    __param(1, (0, common_1.Inject)(index_1.EMPLOYEE_REPOSITORY_TOKEN)),
    __metadata("design:paramtypes", [Object, Object])
], AuditLogService);
//# sourceMappingURL=audit-log.service.js.map