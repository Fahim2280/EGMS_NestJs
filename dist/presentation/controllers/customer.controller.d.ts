import { FileService } from "../../infrastructure/services/file.service";
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Request, Response } from 'express';
import { CreateCustomerDto, UpdateCustomerDto } from "../../application/dtos/customer.dto";
import { CreateGuarantorDto, UpdateGuarantorDto } from "../../application/dtos/guarantor.dto";
import { AuditLogService } from "../../application/services/audit-log.service";
import { IGuarantorRepository } from "../../domain/index";
export declare class CustomerController {
    private readonly commandBus;
    private readonly queryBus;
    private readonly auditLogService;
    private readonly fileService;
    private readonly guarantorRepo;
    constructor(commandBus: CommandBus, queryBus: QueryBus, auditLogService: AuditLogService, fileService: FileService, guarantorRepo: IGuarantorRepository);
    listCustomers(req: Request, res: Response, search?: string, garageId?: string, fromDate?: string, toDate?: string, preset?: string, page?: string): Promise<void>;
    renderCreateForm(req: Request, res: Response, garageId?: string): Promise<void>;
    handleCreate(dto: CreateCustomerDto, files: any[], req: Request, res: Response): Promise<void>;
    checkCustomerCode(req: Request, res: Response, code?: string, exclude?: string): Promise<Response<any, Record<string, any>>>;
    renderDetails(id: string, req: Request, res: Response, fromDate?: string, toDate?: string, preset?: string): Promise<void>;
    renderEditForm(id: string, req: Request, res: Response): Promise<void>;
    handleUpdate(id: string, dto: UpdateCustomerDto, files: any[], req: Request, res: Response): Promise<void>;
    handleDelete(id: string, req: Request, res: Response): Promise<void>;
    handleToggleStatus(id: string, req: Request, res: Response): Promise<void>;
    handleCreateGuarantor(customerId: string, dto: CreateGuarantorDto, files: any[], req: Request, res: Response): Promise<void>;
    renderEditGuarantorForm(customerId: string, guarantorId: string, req: Request, res: Response): Promise<void>;
    handleUpdateGuarantor(customerId: string, guarantorId: string, dto: UpdateGuarantorDto, files: any[], req: Request, res: Response): Promise<void>;
    handleDeleteGuarantor(customerId: string, guarantorId: string, req: Request, res: Response): Promise<void>;
}
