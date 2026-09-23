import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  Inject,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Request, Response } from 'express';
import { existsSync, createReadStream, statSync } from 'fs';
import { FileService } from '../../infrastructure/services/file.service';
import { JwtAuthGuard } from '../../infrastructure/auth/jwt-auth.guard';
import {
  CUSTOMER_REPOSITORY_TOKEN,
  ICustomerRepository,
  EMPLOYEE_REPOSITORY_TOKEN,
  IEmployeeRepository,
  GUARANTOR_REPOSITORY_TOKEN,
  IGuarantorRepository,
} from '@domain/index';
import { AuditLogService } from '../../application/services/audit-log.service';

function getMimeType(filePath: string): string {
  const ext = filePath.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'pdf': return 'application/pdf';
    case 'jpg':
    case 'jpeg': return 'image/jpeg';
    case 'png': return 'image/png';
    case 'webp': return 'image/webp';
    case 'gif': return 'image/gif';
    case 'doc': return 'application/msword';
    case 'docx': return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    case 'xls': return 'application/vnd.ms-excel';
    case 'xlsx': return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    case 'txt': return 'text/plain';
    case 'csv': return 'text/csv';
    default: return 'application/octet-stream';
  }
}

@Controller()
@UseGuards(JwtAuthGuard)
export class FileController {
  constructor(
    private readonly fileService: FileService,
    @Inject(CUSTOMER_REPOSITORY_TOKEN)
    private readonly customerRepo: ICustomerRepository,
    @Inject(EMPLOYEE_REPOSITORY_TOKEN)
    private readonly employeeRepo: IEmployeeRepository,
    @Inject(GUARANTOR_REPOSITORY_TOKEN)
    private readonly guarantorRepo: IGuarantorRepository,
    private readonly auditLogService: AuditLogService,
  ) {}

  /**
   * Secure file download endpoint with Content-Disposition: attachment
   */
  @Get('files/download')
  async downloadFile(
    @Query('path') filePath: string,
    @Query('name') fileName: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    if (!filePath) {
      return res.status(400).send('File path parameter is required.');
    }

    try {
      const physicalPath = this.fileService.getPhysicalPath(filePath);
      if (!existsSync(physicalPath)) {
        return res.status(404).send('Requested file was not found on server.');
      }

      const stat = statSync(physicalPath);
      const downloadName = (fileName || filePath.split('/').pop() || 'document').trim();
      const mime = getMimeType(downloadName);

      res.setHeader('Content-Type', mime);
      res.setHeader('Content-Length', stat.size);
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${encodeURIComponent(downloadName)}"; filename*=UTF-8''${encodeURIComponent(downloadName)}`,
      );

      createReadStream(physicalPath).pipe(res);
    } catch (err: any) {
      return res.status(400).send(err.message || 'Could not process download.');
    }
  }

  /**
   * Secure file inline preview endpoint (for PDFs and Images)
   */
  @Get('files/preview')
  async previewFile(
    @Query('path') filePath: string,
    @Query('name') fileName: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    if (!filePath) {
      return res.status(400).send('File path parameter is required.');
    }

    try {
      const physicalPath = this.fileService.getPhysicalPath(filePath);
      if (!existsSync(physicalPath)) {
        return res.status(404).send('Requested file was not found on server.');
      }

      const stat = statSync(physicalPath);
      const previewName = (fileName || filePath.split('/').pop() || 'document').trim();
      const mime = getMimeType(previewName);

      res.setHeader('Content-Type', mime);
      res.setHeader('Content-Length', stat.size);
      res.setHeader(
        'Content-Disposition',
        `inline; filename="${encodeURIComponent(previewName)}"`,
      );

      createReadStream(physicalPath).pipe(res);
    } catch (err: any) {
      return res.status(400).send(err.message || 'Could not process preview.');
    }
  }

  // --- CUSTOMER DOCUMENTS ---

  @Post('customers/:id/documents')
  @UseInterceptors(FilesInterceptor('files', 10, { limits: { fileSize: 25 * 1024 * 1024 } }))
  async uploadCustomerDocuments(
    @Param('id') customerId: string,
    @UploadedFiles() files: any[],
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const user = (req as any).user;
    try {
      const customer = await this.customerRepo.getByIdAsync(customerId);
      if (!customer || customer.companyId !== user.companyId) {
        throw new NotFoundException('Customer not found.');
      }

      if (files && files.length > 0) {
        const bodyTag = (req.body?.tag || 'OTHER').trim();
        const uploadedDocs = await this.fileService.uploadFiles(
          files,
          'customers',
          files.map(() => bodyTag),
          user.name || user.email,
        );

        for (const doc of uploadedDocs) {
          customer.addDocument(doc);
        }
        await this.customerRepo.updateAsync(customer);

        await this.auditLogService.record({
          companyId: user.companyId,
          userId: user.sub || user.companyId,
          userName: user.name,
          userRole: user.role,
          action: 'UPDATE',
          entityType: 'CUSTOMER',
          entityId: customerId,
          entityName: customer.name,
          details: `Uploaded ${uploadedDocs.length} document(s) for customer ${customer.name}`,
          req,
        });
      }

      return res.redirect(`/customers/${customerId}?success=Documents+uploaded+successfully`);
    } catch (err: any) {
      return res.redirect(`/customers/${customerId}?error=${encodeURIComponent(err.message || 'Failed to upload documents')}`);
    }
  }

  @Post('customers/:id/documents/:docId/delete')
  async deleteCustomerDocument(
    @Param('id') customerId: string,
    @Param('docId') docId: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const user = (req as any).user;
    try {
      const customer = await this.customerRepo.getByIdAsync(customerId);
      if (!customer || customer.companyId !== user.companyId) {
        throw new NotFoundException('Customer not found.');
      }

      const removed = customer.removeDocument(docId);
      if (removed) {
        await this.fileService.deleteFile(removed.filePath);
        await this.customerRepo.updateAsync(customer);

        await this.auditLogService.record({
          companyId: user.companyId,
          userId: user.sub || user.companyId,
          userName: user.name,
          userRole: user.role,
          action: 'DELETE',
          entityType: 'CUSTOMER',
          entityId: customerId,
          entityName: customer.name,
          details: `Removed document "${removed.originalName}" for customer ${customer.name}`,
          req,
        });
      }

      return res.redirect(`/customers/${customerId}?success=Document+removed+successfully`);
    } catch (err: any) {
      return res.redirect(`/customers/${customerId}?error=${encodeURIComponent(err.message || 'Failed to remove document')}`);
    }
  }

  // --- EMPLOYEE DOCUMENTS ---

  @Post('employees/:id/documents')
  @UseInterceptors(FilesInterceptor('files', 10, { limits: { fileSize: 25 * 1024 * 1024 } }))
  async uploadEmployeeDocuments(
    @Param('id') employeeId: string,
    @UploadedFiles() files: any[],
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const user = (req as any).user;
    try {
      const employee = await this.employeeRepo.findById(employeeId);
      if (!employee || employee.companyId !== user.companyId) {
        throw new NotFoundException('Employee not found.');
      }

      if (files && files.length > 0) {
        const bodyTag = (req.body?.tag || 'OTHER').trim();
        const uploadedDocs = await this.fileService.uploadFiles(
          files,
          'employees',
          files.map(() => bodyTag),
          user.name || user.email,
        );

        for (const doc of uploadedDocs) {
          employee.addDocument(doc);
        }
        await this.employeeRepo.save(employee);

        await this.auditLogService.record({
          companyId: user.companyId,
          userId: user.sub || user.companyId,
          userName: user.name,
          userRole: user.role,
          action: 'UPDATE',
          entityType: 'EMPLOYEE',
          entityId: employeeId,
          entityName: employee.name,
          details: `Uploaded ${uploadedDocs.length} document(s) for employee ${employee.name}`,
          req,
        });
      }

      return res.redirect(`/employees/${employeeId}?success=Documents+uploaded+successfully`);
    } catch (err: any) {
      return res.redirect(`/employees/${employeeId}?error=${encodeURIComponent(err.message || 'Failed to upload documents')}`);
    }
  }

  @Post('employees/:id/documents/:docId/delete')
  async deleteEmployeeDocument(
    @Param('id') employeeId: string,
    @Param('docId') docId: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const user = (req as any).user;
    try {
      const employee = await this.employeeRepo.findById(employeeId);
      if (!employee || employee.companyId !== user.companyId) {
        throw new NotFoundException('Employee not found.');
      }

      const removed = employee.removeDocument(docId);
      if (removed) {
        await this.fileService.deleteFile(removed.filePath);
        await this.employeeRepo.save(employee);

        await this.auditLogService.record({
          companyId: user.companyId,
          userId: user.sub || user.companyId,
          userName: user.name,
          userRole: user.role,
          action: 'DELETE',
          entityType: 'EMPLOYEE',
          entityId: employeeId,
          entityName: employee.name,
          details: `Removed document "${removed.originalName}" for employee ${employee.name}`,
          req,
        });
      }

      return res.redirect(`/employees/${employeeId}?success=Document+removed+successfully`);
    } catch (err: any) {
      return res.redirect(`/employees/${employeeId}?error=${encodeURIComponent(err.message || 'Failed to remove document')}`);
    }
  }

  // --- GUARANTOR DOCUMENTS ---

  @Post('customers/:customerId/guarantors/:guarantorId/documents')
  @UseInterceptors(FilesInterceptor('files', 10, { limits: { fileSize: 25 * 1024 * 1024 } }))
  async uploadGuarantorDocuments(
    @Param('customerId') customerId: string,
    @Param('guarantorId') guarantorId: string,
    @UploadedFiles() files: any[],
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const user = (req as any).user;
    try {
      const guarantor = await this.guarantorRepo.getByIdAsync(guarantorId);
      if (!guarantor || guarantor.companyId !== user.companyId || guarantor.customerId !== customerId) {
        throw new NotFoundException('Guarantor not found.');
      }

      if (files && files.length > 0) {
        const bodyTag = (req.body?.tag || 'OTHER').trim();
        const uploadedDocs = await this.fileService.uploadFiles(
          files,
          'guarantors',
          files.map(() => bodyTag),
          user.name || user.email,
        );

        for (const doc of uploadedDocs) {
          guarantor.addDocument(doc);
        }
        await this.guarantorRepo.updateAsync(guarantor);
      }

      return res.redirect(`/customers/${customerId}?success=Guarantor+documents+uploaded+successfully`);
    } catch (err: any) {
      return res.redirect(`/customers/${customerId}?error=${encodeURIComponent(err.message || 'Failed to upload guarantor documents')}`);
    }
  }

  @Post('customers/:customerId/guarantors/:guarantorId/documents/:docId/delete')
  async deleteGuarantorDocument(
    @Param('customerId') customerId: string,
    @Param('guarantorId') guarantorId: string,
    @Param('docId') docId: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const user = (req as any).user;
    try {
      const guarantor = await this.guarantorRepo.getByIdAsync(guarantorId);
      if (!guarantor || guarantor.companyId !== user.companyId || guarantor.customerId !== customerId) {
        throw new NotFoundException('Guarantor not found.');
      }

      const removed = guarantor.removeDocument(docId);
      if (removed) {
        await this.fileService.deleteFile(removed.filePath);
        await this.guarantorRepo.updateAsync(guarantor);
      }

      return res.redirect(`/customers/${customerId}?success=Guarantor+document+removed`);
    } catch (err: any) {
      return res.redirect(`/customers/${customerId}?error=${encodeURIComponent(err.message || 'Failed to remove guarantor document')}`);
    }
  }
}
