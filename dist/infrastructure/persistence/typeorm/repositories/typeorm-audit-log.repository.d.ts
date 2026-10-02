import { OnModuleInit } from '@nestjs/common';
import { Repository } from 'typeorm';
import { AuditLog, AuditLogFilter, AuditLogStats, IAuditLogRepository } from "../../../../domain/index";
import { AuditLogOrmEntity } from '../entities/audit-log.orm-entity';
export declare class TypeOrmAuditLogRepository implements IAuditLogRepository, OnModuleInit {
    private readonly repo;
    private readonly logger;
    constructor(repo: Repository<AuditLogOrmEntity>);
    onModuleInit(): Promise<void>;
    save(domain: AuditLog): Promise<AuditLog>;
    findFiltered(companyId: string, filter: AuditLogFilter): Promise<{
        logs: AuditLog[];
        total: number;
    }>;
    findAllForExport(companyId: string, filter: AuditLogFilter): Promise<AuditLog[]>;
    getStats(companyId: string): Promise<AuditLogStats>;
    protected toDomain(orm: AuditLogOrmEntity): AuditLog;
    protected toOrm(domain: AuditLog): AuditLogOrmEntity;
}
