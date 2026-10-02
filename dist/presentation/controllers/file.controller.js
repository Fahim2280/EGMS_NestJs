"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const fs_1 = require("fs");
const file_service_1 = require("../../infrastructure/services/file.service");
const jwt_auth_guard_1 = require("../../infrastructure/auth/jwt-auth.guard");
const index_1 = require("../../domain/index");
const audit_log_service_1 = require("../../application/services/audit-log.service");
function getMimeType(filePath) {
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
let FileController = class FileController {
    fileService;
    customerRepo;
    employeeRepo;
    guarantorRepo;
    auditLogService;
    constructor(fileService, customerRepo, employeeRepo, guarantorRepo, auditLogService) {
        this.fileService = fileService;
        this.customerRepo = customerRepo;
        this.employeeRepo = employeeRepo;
        this.guarantorRepo = guarantorRepo;
        this.auditLogService = auditLogService;
    }
    async downloadFile(filePath, fileName, req, res) {
        if (!filePath) {
            return res.status(400).send('File path parameter is required.');
        }
        try {
            const physicalPath = this.fileService.getPhysicalPath(filePath);
            if (!(0, fs_1.existsSync)(physicalPath)) {
                return res.status(404).send('Requested file was not found on server.');
            }
            const stat = (0, fs_1.statSync)(physicalPath);
            const downloadName = (fileName || filePath.split('/').pop() || 'document').trim();
            const mime = getMimeType(downloadName);
            res.setHeader('Content-Type', mime);
            res.setHeader('Content-Length', stat.size);
            res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(downloadName)}"; filename*=UTF-8''${encodeURIComponent(downloadName)}`);
            (0, fs_1.createReadStream)(physicalPath).pipe(res);
        }
        catch (err) {
            return res.status(400).send(err.message || 'Could not process download.');
        }
    }
    async previewFile(filePath, fileName, req, res) {
        if (!filePath) {
            return res.status(400).send('File path parameter is required.');
        }
        try {
            const physicalPath = this.fileService.getPhysicalPath(filePath);
            if (!(0, fs_1.existsSync)(physicalPath)) {
                return res.status(404).send('Requested file was not found on server.');
            }
            const stat = (0, fs_1.statSync)(physicalPath);
            const previewName = (fileName || filePath.split('/').pop() || 'document').trim();
            const mime = getMimeType(previewName);
            res.setHeader('Content-Type', mime);
            res.setHeader('Content-Length', stat.size);
            res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(previewName)}"`);
            (0, fs_1.createReadStream)(physicalPath).pipe(res);
        }
        catch (err) {
            return res.status(400).send(err.message || 'Could not process preview.');
        }
    }
    async uploadCustomerDocuments(customerId, files, req, res) {
        const user = req.user;
        try {
            const customer = await this.customerRepo.getByIdAsync(customerId);
            if (!customer || customer.companyId !== user.companyId) {
                throw new common_1.NotFoundException('Customer not found.');
            }
            if (files && files.length > 0) {
                const bodyTag = (req.body?.tag || 'OTHER').trim();
                const uploadedDocs = await this.fileService.uploadFiles(files, 'customers', files.map(() => bodyTag), user.name || user.email);
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
            return res.redirect(`/customers/${customerId}?success=msg.documentsUploaded`);
        }
        catch (err) {
            return res.redirect(`/customers/${customerId}?error=${encodeURIComponent(err.message || 'Failed to upload documents')}`);
        }
    }
    async deleteCustomerDocument(customerId, docId, req, res) {
        const user = req.user;
        try {
            const customer = await this.customerRepo.getByIdAsync(customerId);
            if (!customer || customer.companyId !== user.companyId) {
                throw new common_1.NotFoundException('Customer not found.');
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
            return res.redirect(`/customers/${customerId}?success=msg.documentDeleted`);
        }
        catch (err) {
            return res.redirect(`/customers/${customerId}?error=${encodeURIComponent(err.message || 'Failed to remove document')}`);
        }
    }
    async uploadEmployeeDocuments(employeeId, files, req, res) {
        const user = req.user;
        try {
            const employee = await this.employeeRepo.findById(employeeId);
            if (!employee || employee.companyId !== user.companyId) {
                throw new common_1.NotFoundException('Employee not found.');
            }
            if (files && files.length > 0) {
                const bodyTag = (req.body?.tag || 'OTHER').trim();
                const uploadedDocs = await this.fileService.uploadFiles(files, 'employees', files.map(() => bodyTag), user.name || user.email);
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
            return res.redirect(`/employees/${employeeId}?success=msg.documentsUploaded`);
        }
        catch (err) {
            return res.redirect(`/employees/${employeeId}?error=${encodeURIComponent(err.message || 'Failed to upload documents')}`);
        }
    }
    async deleteEmployeeDocument(employeeId, docId, req, res) {
        const user = req.user;
        try {
            const employee = await this.employeeRepo.findById(employeeId);
            if (!employee || employee.companyId !== user.companyId) {
                throw new common_1.NotFoundException('Employee not found.');
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
            return res.redirect(`/employees/${employeeId}?success=msg.documentDeleted`);
        }
        catch (err) {
            return res.redirect(`/employees/${employeeId}?error=${encodeURIComponent(err.message || 'Failed to remove document')}`);
        }
    }
    async uploadGuarantorDocuments(customerId, guarantorId, files, req, res) {
        const user = req.user;
        try {
            const guarantor = await this.guarantorRepo.getByIdAsync(guarantorId);
            if (!guarantor || guarantor.companyId !== user.companyId || guarantor.customerId !== customerId) {
                throw new common_1.NotFoundException('Guarantor not found.');
            }
            if (files && files.length > 0) {
                const bodyTag = (req.body?.tag || 'OTHER').trim();
                const uploadedDocs = await this.fileService.uploadFiles(files, 'guarantors', files.map(() => bodyTag), user.name || user.email);
                for (const doc of uploadedDocs) {
                    guarantor.addDocument(doc);
                }
                await this.guarantorRepo.updateAsync(guarantor);
            }
            return res.redirect(`/customers/${customerId}?success=msg.documentsUploaded`);
        }
        catch (err) {
            return res.redirect(`/customers/${customerId}?error=${encodeURIComponent(err.message || 'Failed to upload guarantor documents')}`);
        }
    }
    async deleteGuarantorDocument(customerId, guarantorId, docId, req, res) {
        const user = req.user;
        try {
            const guarantor = await this.guarantorRepo.getByIdAsync(guarantorId);
            if (!guarantor || guarantor.companyId !== user.companyId || guarantor.customerId !== customerId) {
                throw new common_1.NotFoundException('Guarantor not found.');
            }
            const removed = guarantor.removeDocument(docId);
            if (removed) {
                await this.fileService.deleteFile(removed.filePath);
                await this.guarantorRepo.updateAsync(guarantor);
            }
            return res.redirect(`/customers/${customerId}?success=msg.documentDeleted`);
        }
        catch (err) {
            return res.redirect(`/customers/${customerId}?error=${encodeURIComponent(err.message || 'Failed to remove guarantor document')}`);
        }
    }
    async uploadEmployeeGuarantorDocuments(employeeId, guarantorId, files, req, res) {
        const user = req.user;
        try {
            const guarantor = await this.guarantorRepo.getByIdAsync(guarantorId);
            if (!guarantor || guarantor.companyId !== user.companyId || guarantor.employeeId !== employeeId) {
                throw new common_1.NotFoundException('Employee guarantor not found.');
            }
            if (files && files.length > 0) {
                const bodyTag = (req.body?.tag || 'OTHER').trim();
                const uploadedDocs = await this.fileService.uploadFiles(files, 'guarantors', files.map(() => bodyTag), user.name || user.email);
                for (const doc of uploadedDocs) {
                    guarantor.addDocument(doc);
                }
                await this.guarantorRepo.updateAsync(guarantor);
            }
            return res.redirect(`/employees/${employeeId}?success=msg.documentsUploaded`);
        }
        catch (err) {
            return res.redirect(`/employees/${employeeId}?error=${encodeURIComponent(err.message || 'Failed to upload guarantor documents')}`);
        }
    }
    async deleteEmployeeGuarantorDocument(employeeId, guarantorId, docId, req, res) {
        const user = req.user;
        try {
            const guarantor = await this.guarantorRepo.getByIdAsync(guarantorId);
            if (!guarantor || guarantor.companyId !== user.companyId || guarantor.employeeId !== employeeId) {
                throw new common_1.NotFoundException('Employee guarantor not found.');
            }
            const removed = guarantor.removeDocument(docId);
            if (removed) {
                await this.fileService.deleteFile(removed.filePath);
                await this.guarantorRepo.updateAsync(guarantor);
            }
            return res.redirect(`/employees/${employeeId}?success=msg.documentDeleted`);
        }
        catch (err) {
            return res.redirect(`/employees/${employeeId}?error=${encodeURIComponent(err.message || 'Failed to remove guarantor document')}`);
        }
    }
};
exports.FileController = FileController;
__decorate([
    (0, common_1.Get)('files/download'),
    __param(0, (0, common_1.Query)('path')),
    __param(1, (0, common_1.Query)('name')),
    __param(2, (0, common_1.Req)()),
    __param(3, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, Object]),
    __metadata("design:returntype", Promise)
], FileController.prototype, "downloadFile", null);
__decorate([
    (0, common_1.Get)('files/preview'),
    __param(0, (0, common_1.Query)('path')),
    __param(1, (0, common_1.Query)('name')),
    __param(2, (0, common_1.Req)()),
    __param(3, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, Object]),
    __metadata("design:returntype", Promise)
], FileController.prototype, "previewFile", null);
__decorate([
    (0, common_1.Post)('customers/:id/documents'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('files', 10, { limits: { fileSize: 25 * 1024 * 1024 } })),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.UploadedFiles)()),
    __param(2, (0, common_1.Req)()),
    __param(3, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Array, Object, Object]),
    __metadata("design:returntype", Promise)
], FileController.prototype, "uploadCustomerDocuments", null);
__decorate([
    (0, common_1.Post)('customers/:id/documents/:docId/delete'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('docId')),
    __param(2, (0, common_1.Req)()),
    __param(3, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, Object]),
    __metadata("design:returntype", Promise)
], FileController.prototype, "deleteCustomerDocument", null);
__decorate([
    (0, common_1.Post)('employees/:id/documents'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('files', 10, { limits: { fileSize: 25 * 1024 * 1024 } })),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.UploadedFiles)()),
    __param(2, (0, common_1.Req)()),
    __param(3, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Array, Object, Object]),
    __metadata("design:returntype", Promise)
], FileController.prototype, "uploadEmployeeDocuments", null);
__decorate([
    (0, common_1.Post)('employees/:id/documents/:docId/delete'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('docId')),
    __param(2, (0, common_1.Req)()),
    __param(3, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, Object]),
    __metadata("design:returntype", Promise)
], FileController.prototype, "deleteEmployeeDocument", null);
__decorate([
    (0, common_1.Post)('customers/:customerId/guarantors/:guarantorId/documents'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('files', 10, { limits: { fileSize: 25 * 1024 * 1024 } })),
    __param(0, (0, common_1.Param)('customerId')),
    __param(1, (0, common_1.Param)('guarantorId')),
    __param(2, (0, common_1.UploadedFiles)()),
    __param(3, (0, common_1.Req)()),
    __param(4, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Array, Object, Object]),
    __metadata("design:returntype", Promise)
], FileController.prototype, "uploadGuarantorDocuments", null);
__decorate([
    (0, common_1.Post)('customers/:customerId/guarantors/:guarantorId/documents/:docId/delete'),
    __param(0, (0, common_1.Param)('customerId')),
    __param(1, (0, common_1.Param)('guarantorId')),
    __param(2, (0, common_1.Param)('docId')),
    __param(3, (0, common_1.Req)()),
    __param(4, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object, Object]),
    __metadata("design:returntype", Promise)
], FileController.prototype, "deleteGuarantorDocument", null);
__decorate([
    (0, common_1.Post)('employees/:employeeId/guarantors/:guarantorId/documents'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('files', 10, { limits: { fileSize: 25 * 1024 * 1024 } })),
    __param(0, (0, common_1.Param)('employeeId')),
    __param(1, (0, common_1.Param)('guarantorId')),
    __param(2, (0, common_1.UploadedFiles)()),
    __param(3, (0, common_1.Req)()),
    __param(4, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Array, Object, Object]),
    __metadata("design:returntype", Promise)
], FileController.prototype, "uploadEmployeeGuarantorDocuments", null);
__decorate([
    (0, common_1.Post)('employees/:employeeId/guarantors/:guarantorId/documents/:docId/delete'),
    __param(0, (0, common_1.Param)('employeeId')),
    __param(1, (0, common_1.Param)('guarantorId')),
    __param(2, (0, common_1.Param)('docId')),
    __param(3, (0, common_1.Req)()),
    __param(4, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object, Object]),
    __metadata("design:returntype", Promise)
], FileController.prototype, "deleteEmployeeGuarantorDocument", null);
exports.FileController = FileController = __decorate([
    (0, common_1.Controller)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(1, (0, common_1.Inject)(index_1.CUSTOMER_REPOSITORY_TOKEN)),
    __param(2, (0, common_1.Inject)(index_1.EMPLOYEE_REPOSITORY_TOKEN)),
    __param(3, (0, common_1.Inject)(index_1.GUARANTOR_REPOSITORY_TOKEN)),
    __metadata("design:paramtypes", [file_service_1.FileService, Object, Object, Object, audit_log_service_1.AuditLogService])
], FileController);
//# sourceMappingURL=file.controller.js.map