import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Request, Response } from 'express';
import { CreateElectricBillDto, UpdateElectricBillDto, PreviewBillRequestDto } from "../../application/dtos/electric-bill.dto";
import { AuditLogService } from "../../application/services/audit-log.service";
export declare class ElectricBillController {
    private readonly commandBus;
    private readonly queryBus;
    private readonly auditLogService;
    constructor(commandBus: CommandBus, queryBus: QueryBus, auditLogService: AuditLogService);
    listBills(req: Request, res: Response, fromDate?: string, toDate?: string, garageId?: string, search?: string, preset?: string, page?: string): Promise<void>;
    renderCreateForm(customerId: string, req: Request, res: Response): Promise<void>;
    handleCreate(dto: CreateElectricBillDto, req: Request, res: Response): Promise<void>;
    renderDetails(id: string, req: Request, res: Response): Promise<void>;
    renderEditForm(id: string, req: Request, res: Response): Promise<void>;
    handleUpdate(id: string, dto: UpdateElectricBillDto, req: Request, res: Response): Promise<void>;
    handleDelete(id: string, req: Request, res: Response): Promise<void>;
    handleGenerateMonthly(fromDateStr: string, toDateStr: string, targetDateStr: string, req: Request, res: Response): Promise<void>;
    getCustomerSummary(customerId: string, req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    previewBill(dto: PreviewBillRequestDto, req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
