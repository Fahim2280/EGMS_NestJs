import { IAuditLogRepository, IEmployeeRepository } from "../../domain/index";
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
export declare class AuditLogService {
    private readonly auditRepo;
    private readonly employeeRepo;
    private readonly logger;
    constructor(auditRepo: IAuditLogRepository, employeeRepo: IEmployeeRepository);
    record(params: RecordAuditLogParams): Promise<void>;
}
