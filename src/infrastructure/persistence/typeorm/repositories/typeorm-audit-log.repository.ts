import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  AuditLog,
  AuditLogFilter,
  AuditLogStats,
  IAuditLogRepository,
} from '@domain/index';
import { AuditLogOrmEntity } from '../entities/audit-log.orm-entity';

@Injectable()
export class TypeOrmAuditLogRepository
  implements IAuditLogRepository, OnModuleInit
{
  private readonly logger = new Logger(TypeOrmAuditLogRepository.name);

  constructor(
    @InjectRepository(AuditLogOrmEntity)
    private readonly repo: Repository<AuditLogOrmEntity>,
  ) {}

  async onModuleInit(): Promise<void> {
    try {
      // 1. Backfill entityName from employees table for existing EMPLOYEE logs
      await this.repo.query(`
        UPDATE audit_logs al
        INNER JOIN employees e ON al.entityId = e.id
        SET al.entityName = e.name
        WHERE al.entityType = 'EMPLOYEE' AND (al.entityName IS NULL OR al.entityName = '' OR al.entityName LIKE '#%')
      `);

      // 2. Clean up details containing employee #ID
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
    } catch (err: any) {
      this.logger.debug(`Audit log employee name backfill skipped: ${err?.message}`);
    }
  }

  async save(domain: AuditLog): Promise<AuditLog> {
    const orm = this.toOrm(domain);
    const saved = await this.repo.save(orm);
    return this.toDomain(saved);
  }

  async findFiltered(
    companyId: string,
    filter: AuditLogFilter,
  ): Promise<{ logs: AuditLog[]; total: number }> {
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
      qb.andWhere(
        '(log.userName LIKE :q OR log.entityName LIKE :q OR log.details LIKE :q OR log.ipAddress LIKE :q)',
        { q },
      );
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

  async findAllForExport(
    companyId: string,
    filter: AuditLogFilter,
  ): Promise<AuditLog[]> {
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
      qb.andWhere(
        '(log.userName LIKE :q OR log.entityName LIKE :q OR log.details LIKE :q OR log.ipAddress LIKE :q)',
        { q },
      );
    }

    qb.orderBy('log.createdDate', 'DESC');
    qb.take(2000); // safety cap for export

    const items = await qb.getMany();
    return items.map((i) => this.toDomain(i));
  }

  async getStats(companyId: string): Promise<AuditLogStats> {
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
      .andWhere(
        "(log.action = 'DELETE' OR log.action = 'PERMISSIONS_UPDATE' OR log.action = 'PASSWORD_RESET')",
      )
      .getCount();

    return {
      totalCount,
      todayCount,
      authCount,
      criticalCount,
    };
  }

  protected toDomain(orm: AuditLogOrmEntity): AuditLog {
    return new AuditLog({
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

  protected toOrm(domain: AuditLog): AuditLogOrmEntity {
    const orm = new AuditLogOrmEntity();
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
}
