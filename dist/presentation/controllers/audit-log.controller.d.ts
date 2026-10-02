import { QueryBus } from '@nestjs/cqrs';
import { Request, Response } from 'express';
import { IAuditLogRepository, IEmployeeRepository } from "../../domain/index";
export declare class AuditLogController {
    private readonly queryBus;
    private readonly auditRepo;
    private readonly employeeRepo;
    constructor(queryBus: QueryBus, auditRepo: IAuditLogRepository, employeeRepo: IEmployeeRepository);
    renderDashboard(req: Request, res: Response, action?: string, entityType?: string, search?: string, days?: string, page?: string, fromDate?: string, toDate?: string): Promise<void>;
    exportCsv(req: Request, res: Response, action?: string, entityType?: string, search?: string, fromDate?: string, toDate?: string): Promise<Response<any, Record<string, any>>>;
    getRecentNotifications(req: Request, res: Response, since?: string): Promise<Response<any, Record<string, any>>>;
}
