import { Request, Response } from 'express';
import { FileService } from '../../infrastructure/services/file.service';
import { ICustomerRepository, IEmployeeRepository, IGuarantorRepository } from "../../domain/index";
import { AuditLogService } from '../../application/services/audit-log.service';
export declare class FileController {
    private readonly fileService;
    private readonly customerRepo;
    private readonly employeeRepo;
    private readonly guarantorRepo;
    private readonly auditLogService;
    constructor(fileService: FileService, customerRepo: ICustomerRepository, employeeRepo: IEmployeeRepository, guarantorRepo: IGuarantorRepository, auditLogService: AuditLogService);
    downloadFile(filePath: string, fileName: string, req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    previewFile(filePath: string, fileName: string, req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    uploadCustomerDocuments(customerId: string, files: any[], req: Request, res: Response): Promise<void>;
    deleteCustomerDocument(customerId: string, docId: string, req: Request, res: Response): Promise<void>;
    uploadEmployeeDocuments(employeeId: string, files: any[], req: Request, res: Response): Promise<void>;
    deleteEmployeeDocument(employeeId: string, docId: string, req: Request, res: Response): Promise<void>;
    uploadGuarantorDocuments(customerId: string, guarantorId: string, files: any[], req: Request, res: Response): Promise<void>;
    deleteGuarantorDocument(customerId: string, guarantorId: string, docId: string, req: Request, res: Response): Promise<void>;
    uploadEmployeeGuarantorDocuments(employeeId: string, guarantorId: string, files: any[], req: Request, res: Response): Promise<void>;
    deleteEmployeeGuarantorDocument(employeeId: string, guarantorId: string, docId: string, req: Request, res: Response): Promise<void>;
}
