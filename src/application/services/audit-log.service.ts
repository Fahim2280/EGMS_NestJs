import { Inject, Injectable, Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import {
  AuditLog,
  AUDIT_LOG_REPOSITORY_TOKEN,
  IAuditLogRepository,
  EMPLOYEE_REPOSITORY_TOKEN,
  IEmployeeRepository,
} from '@domain/index';

export interface RecordAuditLogParams {
  companyId: string;
  userId: string;
  userName?: string;
  userRole?: string;
  action: string;
  entityType: string;
  entityId?: string | null;
  entityName?: string | null;
  details?: string | null;
  req?: any;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class AuditLogService {
  private readonly logger = new Logger(AuditLogService.name);

  constructor(
    @Inject(AUDIT_LOG_REPOSITORY_TOKEN)
    private readonly auditRepo: IAuditLogRepository,
    @Inject(EMPLOYEE_REPOSITORY_TOKEN)
    private readonly employeeRepo: IEmployeeRepository,
  ) {}

  async record(params: RecordAuditLogParams): Promise<void> {
    try {
      let ip = params.ipAddress;
      let ua = params.userAgent;

      if (params.req) {
        ip =
          ip ||
          (params.req.headers?.['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
          params.req.ip ||
          params.req.socket?.remoteAddress ||
          '127.0.0.1';

        ua = ua || (params.req.headers?.['user-agent'] as string);
      }

      // Truncate user agent if overly long to fit varchar(255)
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
          } catch {}
        }

        if (entityName && details) {
          details = details
            .split(`employee #${params.entityId}`).join(`employee ${entityName}`)
            .split(`employee ${params.entityId}`).join(`employee ${entityName}`)
            .split(`#${params.entityId}`).join(entityName);
        }
      }

      const log = AuditLog.create({
        id: uuidv4(),
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
    } catch (err: any) {
      // Non-blocking: audit log errors should never crash the business operation
      this.logger.warn(`Failed to record audit log: ${err.message}`);
    }
  }
}
