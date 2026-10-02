import { FileService } from "../../infrastructure/services/file.service";
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Request, Response } from 'express';
import { CreateEmployeeDto } from "../../application/dtos/employee.dto";
import { AuditLogService } from "../../application/services/audit-log.service";
import { CreateGuarantorDto, UpdateGuarantorDto } from "../../application/dtos/guarantor.dto";
import { IGuarantorRepository } from "../../domain/index";
export declare class EmployeeController {
    private readonly commandBus;
    private readonly queryBus;
    private readonly auditLogService;
    private readonly fileService;
    private readonly guarantorRepo;
    constructor(commandBus: CommandBus, queryBus: QueryBus, auditLogService: AuditLogService, fileService: FileService, guarantorRepo: IGuarantorRepository);
    listEmployees(req: Request, res: Response): Promise<void>;
    renderCreateForm(req: Request, res: Response): void;
    handleCreate(req: Request, dto: CreateEmployeeDto, files: any[], res: Response): Promise<void>;
    listPermissions(req: Request, res: Response): Promise<void>;
    handleUpdatePermissions(id: string, body: any, req: Request, res: Response): Promise<void>;
    viewEmployee(id: string, req: Request, res: Response): Promise<void>;
    renderEditForm(id: string, req: Request, res: Response): Promise<void>;
    handleEdit(id: string, body: any, files: any[], req: Request, res: Response): Promise<void>;
    handleDelete(id: string, req: Request, res: Response): Promise<void>;
    handleCreateGuarantor(employeeId: string, dto: CreateGuarantorDto, files: any[], req: Request, res: Response): Promise<void>;
    renderEditGuarantorForm(employeeId: string, guarantorId: string, req: Request, res: Response): Promise<void>;
    handleUpdateGuarantor(employeeId: string, guarantorId: string, dto: UpdateGuarantorDto, files: any[], req: Request, res: Response): Promise<void>;
    handleDeleteGuarantor(employeeId: string, guarantorId: string, req: Request, res: Response): Promise<void>;
}
