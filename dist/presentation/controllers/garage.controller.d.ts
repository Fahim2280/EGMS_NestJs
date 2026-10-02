import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Request, Response } from 'express';
import { CreateGarageDto, UpdateGarageDto } from "../../application/dtos/garage.dto";
import { AuditLogService } from "../../application/services/audit-log.service";
export declare class GarageController {
    private readonly commandBus;
    private readonly queryBus;
    private readonly auditLogService;
    constructor(commandBus: CommandBus, queryBus: QueryBus, auditLogService: AuditLogService);
    listGarages(req: Request, res: Response, search?: string, fromDate?: string, toDate?: string, preset?: string): Promise<void>;
    renderCreateForm(req: Request, res: Response): void;
    handleCreate(req: Request, dto: CreateGarageDto, res: Response): Promise<void>;
    renderDashboard(id: string, req: Request, res: Response, fromDate?: string, toDate?: string, preset?: string, success?: string): Promise<void>;
    renderEditForm(id: string, req: Request, res: Response): Promise<void>;
    handleUpdate(id: string, dto: UpdateGarageDto, req: Request, res: Response): Promise<void>;
    handleToggleStatus(id: string, req: Request, res: Response): Promise<void>;
}
