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
exports.EmployeeController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const file_service_1 = require("../../infrastructure/services/file.service");
const cqrs_1 = require("@nestjs/cqrs");
const employee_dto_1 = require("../../application/dtos/employee.dto");
const create_employee_command_1 = require("../../application/commands/impl/create-employee.command");
const update_employee_command_1 = require("../../application/commands/impl/update-employee.command");
const delete_employee_command_1 = require("../../application/commands/impl/delete-employee.command");
const update_employee_permission_command_1 = require("../../application/commands/impl/update-employee-permission.command");
const get_employees_by_company_query_1 = require("../../application/queries/impl/get-employees-by-company.query");
const get_employee_by_id_query_1 = require("../../application/queries/impl/get-employee-by-id.query");
const get_garages_by_company_query_1 = require("../../application/queries/impl/get-garages-by-company.query");
const jwt_auth_guard_1 = require("../../infrastructure/auth/jwt-auth.guard");
const roles_guard_1 = require("../../infrastructure/auth/roles.guard");
const roles_decorator_1 = require("../../infrastructure/auth/roles.decorator");
const audit_log_service_1 = require("../../application/services/audit-log.service");
const contact_phone_dto_1 = require("../../application/dtos/contact-phone.dto");
const guarantor_dto_1 = require("../../application/dtos/guarantor.dto");
const create_employee_guarantor_command_1 = require("../../application/commands/impl/create-employee-guarantor.command");
const update_employee_guarantor_command_1 = require("../../application/commands/impl/update-employee-guarantor.command");
const delete_employee_guarantor_command_1 = require("../../application/commands/impl/delete-employee-guarantor.command");
const get_guarantors_by_employee_query_1 = require("../../application/queries/impl/get-guarantors-by-employee.query");
const index_1 = require("../../domain/index");
let EmployeeController = class EmployeeController {
    commandBus;
    queryBus;
    auditLogService;
    fileService;
    guarantorRepo;
    constructor(commandBus, queryBus, auditLogService, fileService, guarantorRepo) {
        this.commandBus = commandBus;
        this.queryBus = queryBus;
        this.auditLogService = auditLogService;
        this.fileService = fileService;
        this.guarantorRepo = guarantorRepo;
    }
    async listEmployees(req, res) {
        const user = req.user;
        const employees = await this.queryBus.execute(new get_employees_by_company_query_1.GetEmployeesByCompanyQuery(user.companyId));
        return res.render('employees/index', {
            title: 'Employee Roster - EGMS Portal',
            activeNav: 'employees',
            user,
            isSuperAdmin: true,
            employees,
        });
    }
    renderCreateForm(req, res) {
        const user = req.user;
        return res.render('employees/create', {
            title: 'Add New Employee - EGMS Portal',
            activeNav: 'employees',
            user,
        });
    }
    async handleCreate(req, dto, files, res) {
        const user = req.user;
        try {
            const employeeUploadedDocs = [];
            const MAX_DOC_SLOTS = 15;
            for (let i = 0; i < MAX_DOC_SLOTS; i++) {
                const slotFieldName = `employeeDocFiles_${i}`;
                const slotFiles = (files || []).filter((f) => f.fieldname === slotFieldName);
                if (slotFiles.length > 0) {
                    const rawTag = dto[`employeeDocType_${i}`] || (req.body && req.body[`employeeDocType_${i}`]) || 'GENERAL';
                    const tags = slotFiles.map(() => rawTag);
                    const uploaded = await this.fileService.uploadFiles(slotFiles, 'employees', tags, `${user.sub || user.companyId}|${user.role || 'SUPER_ADMIN'}`);
                    employeeUploadedDocs.push(...uploaded);
                }
            }
            const legacyEmployeeFiles = (files || []).filter((f) => f.fieldname === 'files');
            if (legacyEmployeeFiles.length > 0) {
                const uploadedDocs = await this.fileService.uploadFiles(legacyEmployeeFiles, 'employees', dto.documentType || 'GENERAL', `${user.sub || user.companyId}|${user.role || 'SUPER_ADMIN'}`);
                employeeUploadedDocs.push(...uploadedDocs);
            }
            const avatarFile = (files || []).find((f) => f.fieldname === 'avatarFile' || f.fieldname === 'profilePicture');
            if (avatarFile && avatarFile.buffer && avatarFile.buffer.length > 0) {
                try {
                    const uploadedPhoto = await this.fileService.uploadFile(avatarFile, 'employees', 'PHOTO', `${user.sub || user.companyId}|${user.role || 'SUPER_ADMIN'}`);
                    employeeUploadedDocs.unshift(uploadedPhoto);
                }
                catch (photoErr) {
                    console.warn('Employee avatar upload failed:', photoErr?.message);
                }
            }
            if (employeeUploadedDocs.length > 0) {
                dto.documents = employeeUploadedDocs;
            }
            const createdEmployee = await this.commandBus.execute(new create_employee_command_1.CreateEmployeeCommand(user.companyId, dto));
            const guarantorsToCreate = [];
            if (dto.guarantorsJson) {
                try {
                    const parsed = typeof dto.guarantorsJson === 'string' ? JSON.parse(dto.guarantorsJson) : dto.guarantorsJson;
                    if (Array.isArray(parsed)) {
                        for (const g of parsed) {
                            if (g && g.name && g.name.trim() && g.nidNumber && g.nidNumber.trim()) {
                                guarantorsToCreate.push({
                                    name: g.name.trim(),
                                    relationship: g.relationship?.trim(),
                                    mobileNumber: g.mobileNumber?.trim() || g.phoneNumber?.trim(),
                                    phoneNumbers: g.phoneNumbers,
                                    phoneNumbersJson: g.phoneNumbersJson || (g.phoneNumbers ? JSON.stringify(g.phoneNumbers) : undefined),
                                    documentType: g.documentType,
                                    nidNumber: g.nidNumber.trim(),
                                    fatherName: g.fatherName?.trim(),
                                    motherName: g.motherName?.trim(),
                                    address: g.address?.trim() || dto.address,
                                });
                            }
                        }
                    }
                }
                catch (e) {
                }
            }
            if (guarantorsToCreate.length === 0 &&
                dto.guarantorName &&
                dto.guarantorName.trim() &&
                dto.guarantorNidNumber &&
                dto.guarantorNidNumber.trim()) {
                guarantorsToCreate.push({
                    name: dto.guarantorName.trim(),
                    relationship: dto.guarantorRelationship?.trim(),
                    mobileNumber: dto.guarantorMobileNumber?.trim(),
                    phoneNumbersJson: dto.guarantorPhoneNumbersJson,
                    documentType: dto.guarantorDocumentType || req.body?.guarantorDocType_0 || req.body?.guarantorDocumentType || 'GENERAL',
                    nidNumber: dto.guarantorNidNumber.trim(),
                    fatherName: dto.guarantorFatherName?.trim(),
                    motherName: dto.guarantorMotherName?.trim(),
                    address: dto.guarantorAddress?.trim() || dto.address,
                });
            }
            const createdGuarantors = [];
            for (let gi = 0; gi < guarantorsToCreate.length; gi++) {
                const gDto = guarantorsToCreate[gi];
                try {
                    const guarantor = await this.commandBus.execute(new create_employee_guarantor_command_1.CreateEmployeeGuarantorCommand(user.companyId, createdEmployee.id, gDto, `${user.sub || user.companyId}|${user.role || 'SUPER_ADMIN'}`));
                    createdGuarantors.push({ index: gi, guarantor });
                }
                catch (gErr) {
                    console.warn(`Failed to create initial guarantor for employee ${createdEmployee.id}:`, gErr?.message);
                }
            }
            for (const { index, guarantor } of createdGuarantors) {
                const gFilesToUpload = [];
                const gFileCategories = [];
                for (let s = 0; s < 15; s++) {
                    const slotFiles = (files || []).filter((f) => f.fieldname === `guarantor_${index}_docFiles_${s}`);
                    if (slotFiles.length > 0) {
                        const slotCat = (req.body?.[`guarantor_${index}_docType_${s}`] || 'GENERAL').trim();
                        for (const f of slotFiles) {
                            gFilesToUpload.push(f);
                            gFileCategories.push(slotCat);
                        }
                    }
                }
                const legacyGFiles = (files || []).filter((f) => f.fieldname === `guarantorFiles_${index}`);
                if (legacyGFiles.length > 0) {
                    const rawDocType = (req.body?.[`guarantorDocType_${index}`] || guarantorsToCreate[index]?.documentType || 'GENERAL').trim();
                    for (const f of legacyGFiles) {
                        gFilesToUpload.push(f);
                        gFileCategories.push(rawDocType);
                    }
                }
                if (gFilesToUpload.length > 0) {
                    try {
                        const uploadedDocs = await this.fileService.uploadFiles(gFilesToUpload, 'guarantors', gFileCategories, user.name || user.email);
                        for (const doc of uploadedDocs) {
                            guarantor.addDocument(doc);
                        }
                        await this.guarantorRepo.updateAsync(guarantor);
                    }
                    catch (docErr) {
                        console.warn(`Failed to upload docs for guarantor index ${index}:`, docErr?.message);
                    }
                }
            }
            await this.auditLogService.record({
                companyId: user.companyId,
                userId: user.sub || user.companyId,
                userName: user.name,
                userRole: user.role,
                action: 'CREATE',
                entityType: 'EMPLOYEE',
                entityId: createdEmployee?.id || undefined,
                entityName: dto.name,
                details: `Registered new employee ${dto.name} (${dto.email})${guarantorsToCreate.length > 0 ? ` with ${guarantorsToCreate.length} guarantor(s)` : ''}`,
                req,
            });
            return res.redirect('/employees?success=msg.employeeCreated');
        }
        catch (err) {
            return res.render('employees/create', {
                title: 'Add New Employee - EGMS Portal',
                activeNav: 'employees',
                user,
                error: err.message || 'Failed to create employee',
                formData: dto,
            });
        }
    }
    async listPermissions(req, res) {
        const user = req.user;
        const [employees, garages] = await Promise.all([
            this.queryBus.execute(new get_employees_by_company_query_1.GetEmployeesByCompanyQuery(user.companyId)),
            this.queryBus.execute(new get_garages_by_company_query_1.GetGaragesByCompanyQuery(user.companyId)),
        ]);
        const stats = {
            total: employees.length,
            superAdmins: employees.filter((e) => e.role === 'SUPER_ADMIN').length,
            generalStaff: employees.filter((e) => e.role === 'GENERAL').length,
            active: employees.filter((e) => e.isActive).length,
            suspended: employees.filter((e) => !e.isActive).length,
        };
        const isBn = req.lang === 'bn' || req.cookies?.lang === 'bn';
        return res.render('employees/permissions', {
            title: isBn
                ? 'ব্যবহারকারী পারমিশন ও গ্যারেজ অ্যাক্সেস নিয়ন্ত্রণ - EGMS Portal'
                : 'User Permissions & Garage Access Control - EGMS Portal',
            activeNav: 'permissions',
            user,
            isSuperAdmin: true,
            employees,
            garages,
            stats,
            isBn,
        });
    }
    async handleUpdatePermissions(id, body, req, res) {
        const user = req.user;
        try {
            const isActive = body.isActive === true ||
                body.isActive === 'true' ||
                body.isActive === 'active' ||
                body.isActive === '1' ||
                body.isActive === 'on';
            const canCreate = body.canCreate === true ||
                body.canCreate === 'true' ||
                body.canCreate === '1' ||
                body.canCreate === 'on';
            const canEdit = body.canEdit === true ||
                body.canEdit === 'true' ||
                body.canEdit === '1' ||
                body.canEdit === 'on';
            const canDelete = body.canDelete === true ||
                body.canDelete === 'true' ||
                body.canDelete === '1' ||
                body.canDelete === 'on';
            const canView = body.canView === undefined
                ? true
                : body.canView === true ||
                    body.canView === 'true' ||
                    body.canView === '1' ||
                    body.canView === 'on';
            let garageIds = [];
            if (body.garageIds) {
                if (Array.isArray(body.garageIds)) {
                    garageIds = body.garageIds.filter(Boolean);
                }
                else if (typeof body.garageIds === 'string' && body.garageIds.trim()) {
                    garageIds = [body.garageIds.trim()];
                }
            }
            const targetEmp = await this.queryBus
                .execute(new get_employee_by_id_query_1.GetEmployeeByIdQuery(id, user.companyId))
                .catch(() => null);
            const targetName = targetEmp?.name || body.employeeName || body.name || `Employee #${id}`;
            await this.commandBus.execute(new update_employee_permission_command_1.UpdateEmployeePermissionCommand(id, user.companyId, body.role || 'GENERAL', isActive, canCreate, canEdit, canDelete, canView, garageIds, `${user.companyId}|SUPER_ADMIN`));
            await this.auditLogService.record({
                companyId: user.companyId,
                userId: user.sub || user.companyId,
                userName: user.name,
                userRole: user.role,
                action: 'PERMISSIONS_UPDATE',
                entityType: 'EMPLOYEE',
                entityId: id,
                entityName: targetEmp?.name || body.employeeName || body.name || undefined,
                details: `Updated role & permissions for employee ${targetName}: role=${body.role || 'GENERAL'}, active=${isActive}, canCreate=${canCreate}, canEdit=${canEdit}, canDelete=${canDelete}`,
                req,
            });
            return res.redirect('/employees/permissions?success=msg.permissionsUpdated');
        }
        catch (err) {
            return res.redirect(`/employees/permissions?error=${encodeURIComponent(err.message || 'Failed to update permissions')}`);
        }
    }
    async viewEmployee(id, req, res) {
        const user = req.user;
        try {
            const [employee, guarantors] = await Promise.all([
                this.queryBus.execute(new get_employee_by_id_query_1.GetEmployeeByIdQuery(id, user.companyId)),
                this.queryBus.execute(new get_guarantors_by_employee_query_1.GetGuarantorsByEmployeeQuery(id, user.companyId)).catch(() => []),
            ]);
            return res.render('employees/details', {
                title: `${employee.name} - Employee Details`,
                activeNav: 'employees',
                user,
                isSuperAdmin: true,
                employee: { ...employee, guarantors },
            });
        }
        catch {
            return res.redirect('/employees');
        }
    }
    async renderEditForm(id, req, res) {
        const user = req.user;
        try {
            const employee = await this.queryBus.execute(new get_employee_by_id_query_1.GetEmployeeByIdQuery(id, user.companyId));
            return res.render('employees/edit', {
                title: `Edit ${employee.name} - EGMS Portal`,
                activeNav: 'employees',
                user,
                employee,
            });
        }
        catch {
            return res.redirect('/employees');
        }
    }
    async handleEdit(id, body, files, req, res) {
        const user = req.user;
        try {
            const phones = (0, contact_phone_dto_1.parsePhoneNumbersInput)(body.phoneNumbersJson || body.phoneNumbers, body.phoneNumber);
            const primaryPhone = phones.find((p) => p.isPrimary) || phones[0];
            const phoneToUse = primaryPhone ? primaryPhone.number : body.phoneNumber;
            let documentsToSet = undefined;
            const existingEmployee = await this.queryBus.execute(new get_employee_by_id_query_1.GetEmployeeByIdQuery(id, user.companyId));
            let existingDocs = existingEmployee?.documents ? [...existingEmployee.documents] : [];
            let docsModified = false;
            if (body.removeAvatar === 'true') {
                existingDocs = existingDocs.filter((d) => d.tag !== 'PHOTO' && d.tag !== 'AVATAR');
                docsModified = true;
            }
            const avatarFile = (files || []).find((f) => f.fieldname === 'avatarFile' || f.fieldname === 'profilePicture');
            if (avatarFile && avatarFile.buffer && avatarFile.buffer.length > 0) {
                try {
                    const uploadedPhoto = await this.fileService.uploadFile(avatarFile, 'employees', 'PHOTO', `${user.sub || user.companyId}|${user.role || 'SUPER_ADMIN'}`);
                    existingDocs = existingDocs.filter((d) => d.tag !== 'PHOTO' && d.tag !== 'AVATAR');
                    existingDocs.unshift(uploadedPhoto);
                    docsModified = true;
                }
                catch (photoErr) {
                    console.warn('Employee avatar update failed:', photoErr?.message);
                }
            }
            const regularFiles = (files || []).filter((f) => f.fieldname === 'files');
            if (regularFiles.length > 0) {
                const uploadedDocs = await this.fileService.uploadFiles(regularFiles, 'employees', body.documentType || 'GENERAL');
                existingDocs.push(...uploadedDocs);
                docsModified = true;
            }
            if (docsModified) {
                documentsToSet = existingDocs;
            }
            await this.commandBus.execute(new update_employee_command_1.UpdateEmployeeCommand(id, user.companyId, body.name, body.address, phoneToUse, body.nidNumber, `${user.companyId}|SUPER_ADMIN`, phones, documentsToSet));
            await this.auditLogService.record({
                companyId: user.companyId,
                userId: user.sub || user.companyId,
                userName: user.name,
                userRole: user.role,
                action: 'UPDATE',
                entityType: 'EMPLOYEE',
                entityId: id,
                entityName: body.name,
                details: `Updated profile details for employee ${body.name}`,
                req,
            });
            return res.redirect(`/employees/${id}?success=msg.employeeUpdated`);
        }
        catch (err) {
            const employee = await this.queryBus.execute(new get_employee_by_id_query_1.GetEmployeeByIdQuery(id, user.companyId)).catch(() => body);
            return res.render('employees/edit', {
                title: 'Edit Employee - EGMS Portal',
                activeNav: 'employees',
                user,
                employee: { ...employee, ...body, id },
                error: err.message || 'Failed to update employee',
            });
        }
    }
    async handleDelete(id, req, res) {
        const user = req.user;
        try {
            const targetEmp = await this.queryBus
                .execute(new get_employee_by_id_query_1.GetEmployeeByIdQuery(id, user.companyId))
                .catch(() => null);
            const targetName = targetEmp?.name || `Employee #${id}`;
            await this.commandBus.execute(new delete_employee_command_1.DeleteEmployeeCommand(id, user.companyId, `${user.companyId}|SUPER_ADMIN`));
            await this.auditLogService.record({
                companyId: user.companyId,
                userId: user.sub || user.companyId,
                userName: user.name,
                userRole: user.role,
                action: 'DELETE',
                entityType: 'EMPLOYEE',
                entityId: id,
                entityName: targetEmp?.name || undefined,
                details: `Deleted employee record for ${targetName}`,
                req,
            });
            return res.redirect('/employees?success=msg.employeeDeleted');
        }
        catch {
            return res.redirect('/employees?error=msg.genericError');
        }
    }
    async handleCreateGuarantor(employeeId, dto, files, req, res) {
        const user = req.user;
        try {
            const allFiles = files || [];
            const filesToUpload = [];
            const categories = [];
            for (let s = 0; s < 15; s++) {
                const slotFiles = allFiles.filter((f) => f.fieldname === `guarantorDocFiles_${s}`);
                if (slotFiles.length > 0) {
                    const slotCat = (req.body?.[`guarantorDocType_${s}`] || 'GENERAL').trim();
                    for (const f of slotFiles) {
                        filesToUpload.push(f);
                        categories.push(slotCat);
                    }
                }
            }
            const legacyFiles = allFiles.filter((f) => f.fieldname === 'files');
            if (legacyFiles.length > 0) {
                const legacyCat = (dto.documentType || req.body?.documentType || req.body?.type || 'GENERAL').trim();
                for (const f of legacyFiles) {
                    filesToUpload.push(f);
                    categories.push(legacyCat);
                }
            }
            if (filesToUpload.length > 0) {
                const uploadedDocs = await this.fileService.uploadFiles(filesToUpload, 'guarantors', categories, user.name || user.email);
                dto.documents = uploadedDocs;
            }
            await this.commandBus.execute(new create_employee_guarantor_command_1.CreateEmployeeGuarantorCommand(user.companyId, employeeId, dto, `${user.sub || user.companyId}|${user.role || 'SUPER_ADMIN'}`));
            await this.auditLogService.record({
                companyId: user.companyId,
                userId: user.sub || user.companyId,
                userName: user.name,
                userRole: user.role,
                action: 'EMPLOYEE_GUARANTOR_CREATED',
                entityType: 'EMPLOYEE_GUARANTOR',
                entityId: employeeId,
                entityName: dto.name,
                details: `Added guarantor ${dto.name} (${dto.relationship || 'N/A'}) to employee #${employeeId}`,
                req,
            });
            return res.redirect(`/employees/${employeeId}?success=msg.guarantorAdded`);
        }
        catch (err) {
            return res.redirect(`/employees/${employeeId}?error=${encodeURIComponent(err.message || 'Failed to add guarantor')}`);
        }
    }
    async renderEditGuarantorForm(employeeId, guarantorId, req, res) {
        const user = req.user;
        try {
            const employee = await this.queryBus.execute(new get_employee_by_id_query_1.GetEmployeeByIdQuery(employeeId, user.companyId));
            const guarantors = await this.queryBus.execute(new get_guarantors_by_employee_query_1.GetGuarantorsByEmployeeQuery(employeeId, user.companyId));
            const guarantor = guarantors.find((g) => g.id === guarantorId);
            if (!guarantor) {
                return res.redirect(`/employees/${employeeId}?error=Guarantor+not+found`);
            }
            return res.render('employees/edit-guarantor', {
                title: `Edit Guarantor: ${guarantor.name} - EGMS Portal`,
                activeNav: 'employees',
                user,
                isSuperAdmin: true,
                employee,
                guarantor,
            });
        }
        catch {
            return res.redirect(`/employees/${employeeId}`);
        }
    }
    async handleUpdateGuarantor(employeeId, guarantorId, dto, files, req, res) {
        const user = req.user;
        try {
            const allFiles = files || [];
            const filesToUpload = [];
            const categories = [];
            for (let s = 0; s < 15; s++) {
                const slotFiles = allFiles.filter((f) => f.fieldname === `guarantorDocFiles_${s}`);
                if (slotFiles.length > 0) {
                    const slotCat = (req.body?.[`guarantorDocType_${s}`] || 'GENERAL').trim();
                    for (const f of slotFiles) {
                        filesToUpload.push(f);
                        categories.push(slotCat);
                    }
                }
            }
            const legacyFiles = allFiles.filter((f) => f.fieldname === 'files');
            if (legacyFiles.length > 0) {
                const legacyCat = (dto.documentType || req.body?.documentType || 'GENERAL').trim();
                for (const f of legacyFiles) {
                    filesToUpload.push(f);
                    categories.push(legacyCat);
                }
            }
            if (filesToUpload.length > 0) {
                const uploadedDocs = await this.fileService.uploadFiles(filesToUpload, 'guarantors', categories, user.name || user.email);
                const guarantors = await this.queryBus.execute(new get_guarantors_by_employee_query_1.GetGuarantorsByEmployeeQuery(employeeId, user.companyId));
                const currentGuarantor = guarantors.find((g) => g.id === guarantorId);
                const existingDocs = currentGuarantor?.documents || [];
                dto.documents = [...existingDocs, ...uploadedDocs];
            }
            await this.commandBus.execute(new update_employee_guarantor_command_1.UpdateEmployeeGuarantorCommand(user.companyId, employeeId, guarantorId, dto, `${user.sub || user.companyId}|${user.role || 'SUPER_ADMIN'}`));
            await this.auditLogService.record({
                companyId: user.companyId,
                userId: user.sub || user.companyId,
                userName: user.name,
                userRole: user.role,
                action: 'EMPLOYEE_GUARANTOR_UPDATED',
                entityType: 'EMPLOYEE_GUARANTOR',
                entityId: guarantorId,
                entityName: dto.name,
                details: `Updated guarantor ${dto.name} for employee #${employeeId}`,
                req,
            });
            return res.redirect(`/employees/${employeeId}?success=msg.guarantorUpdated`);
        }
        catch (err) {
            return res.render('employees/edit-guarantor', {
                title: `Edit Guarantor - EGMS Portal`,
                activeNav: 'employees',
                user,
                isSuperAdmin: true,
                employee: { id: employeeId },
                guarantor: { id: guarantorId, ...dto },
                error: err.message || 'Failed to update guarantor',
            });
        }
    }
    async handleDeleteGuarantor(employeeId, guarantorId, req, res) {
        const user = req.user;
        try {
            await this.commandBus.execute(new delete_employee_guarantor_command_1.DeleteEmployeeGuarantorCommand(user.companyId, employeeId, guarantorId, `${user.sub || user.companyId}|${user.role || 'SUPER_ADMIN'}`));
            await this.auditLogService.record({
                companyId: user.companyId,
                userId: user.sub || user.companyId,
                userName: user.name,
                userRole: user.role,
                action: 'EMPLOYEE_GUARANTOR_DELETED',
                entityType: 'EMPLOYEE_GUARANTOR',
                entityId: guarantorId,
                details: `Removed guarantor #${guarantorId} from employee #${employeeId}`,
                req,
            });
            return res.redirect(`/employees/${employeeId}?success=msg.guarantorRemoved`);
        }
        catch (err) {
            return res.redirect(`/employees/${employeeId}?error=${encodeURIComponent(err.message || 'Failed to delete guarantor')}`);
        }
    }
};
exports.EmployeeController = EmployeeController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], EmployeeController.prototype, "listEmployees", null);
__decorate([
    (0, common_1.Get)('new'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], EmployeeController.prototype, "renderCreateForm", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseInterceptors)((0, platform_express_1.AnyFilesInterceptor)({ limits: { fileSize: 25 * 1024 * 1024 } })),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.UploadedFiles)()),
    __param(3, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, employee_dto_1.CreateEmployeeDto, Array, Object]),
    __metadata("design:returntype", Promise)
], EmployeeController.prototype, "handleCreate", null);
__decorate([
    (0, common_1.Get)('permissions'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], EmployeeController.prototype, "listPermissions", null);
__decorate([
    (0, common_1.Post)(':id/permissions'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __param(3, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], EmployeeController.prototype, "handleUpdatePermissions", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], EmployeeController.prototype, "viewEmployee", null);
__decorate([
    (0, common_1.Get)(':id/edit'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], EmployeeController.prototype, "renderEditForm", null);
__decorate([
    (0, common_1.Post)(':id/edit'),
    (0, common_1.UseInterceptors)((0, platform_express_1.AnyFilesInterceptor)({ limits: { fileSize: 25 * 1024 * 1024 } })),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.UploadedFiles)()),
    __param(3, (0, common_1.Req)()),
    __param(4, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Array, Object, Object]),
    __metadata("design:returntype", Promise)
], EmployeeController.prototype, "handleEdit", null);
__decorate([
    (0, common_1.Post)(':id/delete'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], EmployeeController.prototype, "handleDelete", null);
__decorate([
    (0, common_1.Post)(':id/guarantors'),
    (0, common_1.UseInterceptors)((0, platform_express_1.AnyFilesInterceptor)({ limits: { fileSize: 25 * 1024 * 1024 } })),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.UploadedFiles)()),
    __param(3, (0, common_1.Req)()),
    __param(4, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, guarantor_dto_1.CreateGuarantorDto, Array, Object, Object]),
    __metadata("design:returntype", Promise)
], EmployeeController.prototype, "handleCreateGuarantor", null);
__decorate([
    (0, common_1.Get)(':id/guarantors/:guarantorId/edit'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('guarantorId')),
    __param(2, (0, common_1.Req)()),
    __param(3, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, Object]),
    __metadata("design:returntype", Promise)
], EmployeeController.prototype, "renderEditGuarantorForm", null);
__decorate([
    (0, common_1.Post)(':id/guarantors/:guarantorId'),
    (0, common_1.UseInterceptors)((0, platform_express_1.AnyFilesInterceptor)({ limits: { fileSize: 25 * 1024 * 1024 } })),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('guarantorId')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.UploadedFiles)()),
    __param(4, (0, common_1.Req)()),
    __param(5, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, guarantor_dto_1.UpdateGuarantorDto, Array, Object, Object]),
    __metadata("design:returntype", Promise)
], EmployeeController.prototype, "handleUpdateGuarantor", null);
__decorate([
    (0, common_1.Post)(':id/guarantors/:guarantorId/delete'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('guarantorId')),
    __param(2, (0, common_1.Req)()),
    __param(3, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, Object]),
    __metadata("design:returntype", Promise)
], EmployeeController.prototype, "handleDeleteGuarantor", null);
exports.EmployeeController = EmployeeController = __decorate([
    (0, common_1.Controller)('employees'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('SUPER_ADMIN'),
    __param(4, (0, common_1.Inject)(index_1.GUARANTOR_REPOSITORY_TOKEN)),
    __metadata("design:paramtypes", [cqrs_1.CommandBus,
        cqrs_1.QueryBus,
        audit_log_service_1.AuditLogService,
        file_service_1.FileService, Object])
], EmployeeController);
//# sourceMappingURL=employee.controller.js.map