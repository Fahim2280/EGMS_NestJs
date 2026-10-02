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
var TypeOrmAuditLogRepository_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypeOrmAuditLogRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const index_1 = require("../../../../domain/index");
const audit_log_orm_entity_1 = require("../entities/audit-log.orm-entity");
let TypeOrmAuditLogRepository = TypeOrmAuditLogRepository_1 = class TypeOrmAuditLogRepository {
    repo;
    logger = new common_1.Logger(TypeOrmAuditLogRepository_1.name);
    constructor(repo) {
        this.repo = repo;
    }
    async onModuleInit() {
        try {
            await this.repo.query(`
        UPDATE audit_logs al
        INNER JOIN employees e ON al.entityId = e.id
        SET al.entityName = e.name
        WHERE al.entityType = 'EMPLOYEE' AND (al.entityName IS NULL OR al.entityName = '' OR al.entityName LIKE '#%')
      `);
            await this.repo.query(`
        UPDATE audit_logs al
        INNER JOIN employees e ON al.entityId = e.id
        SET al.details = REPLACE(al.details, CONCAT('#', e.id), e.name)
        WHERE al.entityType = 'EMPLOYEE' AND al.details LIKE CONCAT('%#', e.id, '%')
      `);
            await this.repo.query(`
        UPDATE audit_logs al
        INNER JOIN employees e ON al.entityId = e.id
        SET al.details = REPLACE(al.details, e.id, e.name)
        WHERE al.entityType = 'EMPLOYEE' AND al.details LIKE CONCAT('%', e.id, '%')
      `);
        }
        catch (err) {
            this.logger.debug(`Audit log employee name backfill skipped: ${err?.message}`);
        }
    }
    async save(domain) {
        const orm = this.toOrm(domain);
        const saved = await this.repo.save(orm);
        return this.toDomain(saved);
    }
    async findFiltered(companyId, filter) {
        const qb = this.repo
            .createQueryBuilder('log')
            .where('log.companyId = :companyId', { companyId });
        if (filter.action && filter.action !== 'ALL') {
            qb.andWhere('log.action = :action', { action: filter.action.toUpperCase() });
        }
        if (filter.entityType && filter.entityType !== 'ALL') {
            qb.andWhere('log.entityType = :entityType', {
                entityType: filter.entityType.toUpperCase(),
            });
        }
        if (filter.userId) {
            qb.andWhere('log.userId = :userId', { userId: filter.userId });
        }
        if (filter.fromDate) {
            qb.andWhere('log.createdDate >= :fromDate', { fromDate: filter.fromDate });
        }
        if (filter.toDate) {
            qb.andWhere('log.createdDate <= :toDate', { toDate: filter.toDate });
        }
        if (filter.search && filter.search.trim()) {
            const q = `%${filter.search.trim()}%`;
            qb.andWhere('(log.userName LIKE :q OR log.entityName LIKE :q OR log.details LIKE :q OR log.ipAddress LIKE :q)', { q });
        }
        qb.orderBy('log.createdDate', 'DESC');
        const page = Math.max(1, filter.page || 1);
        const limit = Math.max(1, Math.min(100, filter.limit || 20));
        qb.skip((page - 1) * limit).take(limit);
        const [items, total] = await qb.getManyAndCount();
        return {
            logs: items.map((i) => this.toDomain(i)),
            total,
        };
    }
    async findAllForExport(companyId, filter) {
        const qb = this.repo
            .createQueryBuilder('log')
            .where('log.companyId = :companyId', { companyId });
        if (filter.action && filter.action !== 'ALL') {
            qb.andWhere('log.action = :action', { action: filter.action.toUpperCase() });
        }
        if (filter.entityType && filter.entityType !== 'ALL') {
            qb.andWhere('log.entityType = :entityType', {
                entityType: filter.entityType.toUpperCase(),
            });
        }
        if (filter.search && filter.search.trim()) {
            const q = `%${filter.search.trim()}%`;
            qb.andWhere('(log.userName LIKE :q OR log.entityName LIKE :q OR log.details LIKE :q OR log.ipAddress LIKE :q)', { q });
        }
        qb.orderBy('log.createdDate', 'DESC');
        qb.take(2000);
        const items = await qb.getMany();
        return items.map((i) => this.toDomain(i));
    }
    async getStats(companyId) {
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
        const totalCount = await this.repo.count({
            where: { companyId },
        });
        const todayCount = await this.repo
            .createQueryBuilder('log')
            .where('log.companyId = :companyId', { companyId })
            .andWhere('log.createdDate >= :startOfToday', { startOfToday })
            .getCount();
        const authCount = await this.repo
            .createQueryBuilder('log')
            .where('log.companyId = :companyId', { companyId })
            .andWhere("log.entityType = 'AUTH'")
            .getCount();
        const criticalCount = await this.repo
            .createQueryBuilder('log')
            .where('log.companyId = :companyId', { companyId })
            .andWhere("(log.action = 'DELETE' OR log.action = 'PERMISSIONS_UPDATE' OR log.action = 'PASSWORD_RESET')")
            .getCount();
        return {
            totalCount,
            todayCount,
            authCount,
            criticalCount,
        };
    }
    toDomain(orm) {
        return new index_1.AuditLog({
            id: orm.id,
            companyId: orm.companyId,
            userId: orm.userId,
            userName: orm.userName,
            userRole: orm.userRole,
            action: orm.action,
            entityType: orm.entityType,
            entityId: orm.entityId,
            entityName: orm.entityName,
            details: orm.details,
            ipAddress: orm.ipAddress,
            userAgent: orm.userAgent,
            createdDate: orm.createdDate ? new Date(orm.createdDate) : new Date(),
        });
    }
    toOrm(domain) {
        const orm = new audit_log_orm_entity_1.AuditLogOrmEntity();
        orm.id = domain.id;
        orm.companyId = domain.companyId;
        orm.userId = domain.userId;
        orm.userName = domain.userName;
        orm.userRole = domain.userRole;
        orm.action = domain.action;
        orm.entityType = domain.entityType;
        orm.entityId = domain.entityId || null;
        orm.entityName = domain.entityName || null;
        orm.details = domain.details || null;
        orm.ipAddress = domain.ipAddress || null;
        orm.userAgent = domain.userAgent || null;
        orm.createdDate = domain.createdDate || new Date();
        return orm;
    }
};
exports.TypeOrmAuditLogRepository = TypeOrmAuditLogRepository;
exports.TypeOrmAuditLogRepository = TypeOrmAuditLogRepository = TypeOrmAuditLogRepository_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(audit_log_orm_entity_1.AuditLogOrmEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], TypeOrmAuditLogRepository);
//# sourceMappingURL=typeorm-audit-log.repository.js.map