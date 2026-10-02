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
exports.CustomerController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const file_service_1 = require("../../infrastructure/services/file.service");
const cqrs_1 = require("@nestjs/cqrs");
const customer_dto_1 = require("../../application/dtos/customer.dto");
const guarantor_dto_1 = require("../../application/dtos/guarantor.dto");
const create_customer_command_1 = require("../../application/commands/impl/create-customer.command");
const update_customer_command_1 = require("../../application/commands/impl/update-customer.command");
const delete_customer_command_1 = require("../../application/commands/impl/delete-customer.command");
const toggle_customer_status_command_1 = require("../../application/commands/impl/toggle-customer-status.command");
const create_guarantor_command_1 = require("../../application/commands/impl/create-guarantor.command");
const update_guarantor_command_1 = require("../../application/commands/impl/update-guarantor.command");
const delete_guarantor_command_1 = require("../../application/commands/impl/delete-guarantor.command");
const get_customers_by_company_query_1 = require("../../application/queries/impl/get-customers-by-company.query");
const get_customer_by_id_query_1 = require("../../application/queries/impl/get-customer-by-id.query");
const get_garages_by_company_query_1 = require("../../application/queries/impl/get-garages-by-company.query");
const get_guarantors_by_customer_query_1 = require("../../application/queries/impl/get-guarantors-by-customer.query");
const jwt_auth_guard_1 = require("../../infrastructure/auth/jwt-auth.guard");
const permissions_guard_1 = require("../../infrastructure/auth/permissions.guard");
const permissions_decorator_1 = require("../../infrastructure/auth/permissions.decorator");
const audit_log_service_1 = require("../../application/services/audit-log.service");
const index_1 = require("../../domain/index");
let CustomerController = class CustomerController {
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
    async listCustomers(req, res, search, garageId, fromDate, toDate, preset, page) {
        const user = req.user;
        const isSuperAdmin = user.role === 'SUPER_ADMIN' || user.isSuperAdmin;
        const allowedGarageIds = isSuperAdmin ? null : (user.garageIds || []);
        const currentPage = Math.max(1, parseInt(page || '1', 10));
        const pageSize = 15;
        let customers = await this.queryBus.execute(new get_customers_by_company_query_1.GetCustomersByCompanyQuery(user.companyId, allowedGarageIds));
        const garages = await this.queryBus.execute(new get_garages_by_company_query_1.GetGaragesByCompanyQuery(user.companyId, allowedGarageIds));
        if (garageId && garageId.trim()) {
            customers = customers.filter((c) => c.garageId === garageId.trim());
        }
        if (fromDate) {
            const fromTime = new Date(fromDate).setHours(0, 0, 0, 0);
            customers = customers.filter((c) => c.createdDate && new Date(c.createdDate).getTime() >= fromTime);
        }
        if (toDate) {
            const toTime = new Date(toDate).setHours(23, 59, 59, 999);
            customers = customers.filter((c) => c.createdDate && new Date(c.createdDate).getTime() <= toTime);
        }
        if (search && search.trim()) {
            const q = search.trim().toLowerCase();
            customers = customers.filter((c) => c.name.toLowerCase().includes(q) ||
                c.mobileNumber?.includes(q) ||
                c.nidNumber?.includes(q) ||
                c.address?.toLowerCase().includes(q) ||
                c.garageName?.toLowerCase().includes(q) ||
                c.customerCode?.toLowerCase().includes(q));
        }
        const totalCount = customers.length;
        const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
        const safePage = Math.min(currentPage, totalPages);
        const paginated = customers.slice((safePage - 1) * pageSize, safePage * pageSize);
        return res.render('customers/index', {
            title: 'Customer Directory - EGMS Portal',
            activeNav: 'customers',
            user,
            isSuperAdmin,
            canCreate: isSuperAdmin || Boolean(user.canCreate),
            canEdit: isSuperAdmin || Boolean(user.canEdit),
            canDelete: isSuperAdmin || Boolean(user.canDelete),
            canView: isSuperAdmin || Boolean(user.canView),
            customers: paginated,
            customerCount: totalCount,
            garages,
            selectedGarageId: garageId || '',
            search: search || '',
            fromDate: fromDate || '',
            toDate: toDate || '',
            preset: preset || '',
            pagination: {
                page: safePage,
                totalPages,
                totalCount,
                hasNext: safePage < totalPages,
                hasPrev: safePage > 1,
            },
        });
    }
    async renderCreateForm(req, res, garageId) {
        const user = req.user;
        const isSuperAdmin = user.role === 'SUPER_ADMIN' || user.isSuperAdmin;
        const allowedGarageIds = isSuperAdmin ? null : (user.garageIds || []);
        const garages = await this.queryBus.execute(new get_garages_by_company_query_1.GetGaragesByCompanyQuery(user.companyId, allowedGarageIds));
        const customerCount = await this.queryBus.execute(new get_customers_by_company_query_1.GetCustomersByCompanyQuery(user.companyId, null));
        const nextNum = String((Array.isArray(customerCount) ? customerCount.length : 0) + 1).padStart(3, '0');
        let isGarageSuspended = false;
        let errorMsg = undefined;
        if (garageId) {
            const selectedGarage = (garages || []).find((g) => g.id === garageId);
            if (selectedGarage && selectedGarage.isActive === false) {
                isGarageSuspended = true;
                errorMsg = 'msg.garageSuspendedCustomerBlocked';
            }
        }
        return res.render('customers/create', {
            title: 'Register New Customer - EGMS Portal',
            activeNav: 'customers',
            user,
            garages,
            selectedGarageId: garageId || '',
            isGarageSuspended,
            error: errorMsg,
            nextCustomerCode: `CUST-${nextNum}`,
        });
    }
    async handleCreate(dto, files, req, res) {
        const user = req.user;
        const isSuperAdmin = user.role === 'SUPER_ADMIN' || user.isSuperAdmin;
        const allowedGarageIds = isSuperAdmin ? null : (user.garageIds || []);
        if (!isSuperAdmin && dto.garageId && !user.garageIds?.includes(dto.garageId)) {
            const garages = await this.queryBus.execute(new get_garages_by_company_query_1.GetGaragesByCompanyQuery(user.companyId, allowedGarageIds));
            return res.render('customers/create', {
                title: 'Register New Customer - EGMS Portal',
                activeNav: 'customers',
                user,
                garages,
                selectedGarageId: dto.garageId || '',
                error: 'You do not have permission to register a customer in this garage.',
                formData: dto,
            });
        }
        if (dto.garageId) {
            const garages = await this.queryBus.execute(new get_garages_by_company_query_1.GetGaragesByCompanyQuery(user.companyId, allowedGarageIds));
            const targetGarage = (garages || []).find((g) => g.id === dto.garageId);
            if (targetGarage && targetGarage.isActive === false) {
                return res.render('customers/create', {
                    title: 'Register New Customer - EGMS Portal',
                    activeNav: 'customers',
                    user,
                    garages,
                    selectedGarageId: dto.garageId || '',
                    isGarageSuspended: true,
                    error: 'msg.garageSuspendedCustomerBlocked',
                    formData: dto,
                });
            }
        }
        try {
            const customerUploadedDocs = [];
            const MAX_DOC_SLOTS = 15;
            for (let i = 0; i < MAX_DOC_SLOTS; i++) {
                const slotFieldName = `customerDocFiles_${i}`;
                const slotFiles = (files || []).filter((f) => f.fieldname === slotFieldName);
                if (slotFiles.length > 0) {
                    const rawTag = dto[`customerDocType_${i}`] || (req.body && req.body[`customerDocType_${i}`]) || 'GENERAL';
                    const tags = slotFiles.map(() => rawTag);
                    const uploaded = await this.fileService.uploadFiles(slotFiles, 'customers', tags, `${user.sub || user.companyId}|${user.role || 'SUPER_ADMIN'}`);
                    customerUploadedDocs.push(...uploaded);
                }
            }
            const legacyCustomerFiles = (files || []).filter((f) => f.fieldname === 'files');
            if (legacyCustomerFiles.length > 0) {
                const uploadedDocs = await this.fileService.uploadFiles(legacyCustomerFiles, 'customers', dto.documentType || 'GENERAL', `${user.sub || user.companyId}|${user.role || 'SUPER_ADMIN'}`);
                customerUploadedDocs.push(...uploadedDocs);
            }
            const avatarFile = (files || []).find((f) => f.fieldname === 'avatarFile' || f.fieldname === 'profilePicture');
            if (avatarFile && avatarFile.buffer && avatarFile.buffer.length > 0) {
                try {
                    const uploadedPhoto = await this.fileService.uploadFile(avatarFile, 'customers', 'PHOTO', `${user.sub || user.companyId}|${user.role || 'SUPER_ADMIN'}`);
                    customerUploadedDocs.unshift(uploadedPhoto);
                }
                catch (photoErr) {
                    console.warn('Customer avatar upload failed:', photoErr?.message);
                }
            }
            if (customerUploadedDocs.length > 0) {
                dto.documents = customerUploadedDocs;
            }
            const customer = await this.commandBus.execute(new create_customer_command_1.CreateCustomerCommand(user.companyId, dto, `${user.sub || user.companyId}|${user.role || 'SUPER_ADMIN'}`));
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
                    const guarantor = await this.commandBus.execute(new create_guarantor_command_1.CreateGuarantorCommand(user.companyId, customer.id, gDto, `${user.sub || user.companyId}|${user.role || 'SUPER_ADMIN'}`));
                    createdGuarantors.push({ index: gi, guarantor });
                }
                catch (gErr) {
                    console.warn(`Failed to create initial guarantor for customer ${customer.id}:`, gErr?.message);
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
                entityType: 'CUSTOMER',
                entityName: dto.name,
                details: `Registered customer ${dto.name} (${dto.customerCode || 'auto-ID'}) with advance ৳${dto.advanceMoney}${guarantorsToCreate.length > 0 ? ` and ${guarantorsToCreate.length} guarantor(s)` : ''}`,
                req,
            });
            return res.redirect('/customers?success=msg.customerCreated');
        }
        catch (err) {
            const garages = await this.queryBus.execute(new get_garages_by_company_query_1.GetGaragesByCompanyQuery(user.companyId, allowedGarageIds));
            return res.render('customers/create', {
                title: 'Register New Customer - EGMS Portal',
                activeNav: 'customers',
                user,
                garages,
                selectedGarageId: dto.garageId || '',
                isGarageSuspended: err.message === 'msg.garageSuspendedCustomerBlocked',
                error: err.message || 'Failed to create customer.',
                formData: dto,
            });
        }
    }
    async checkCustomerCode(req, res, code, exclude) {
        const user = req.user;
        if (!code || !code.trim()) {
            return res.json({ available: true });
        }
        const existing = await this.queryBus.execute(new get_customers_by_company_query_1.GetCustomersByCompanyQuery(user.companyId, null));
        const taken = existing.some((c) => c.customerCode &&
            c.customerCode.toLowerCase() === code.trim().toLowerCase() &&
            c.id !== exclude);
        return res.json({ available: !taken });
    }
    async renderDetails(id, req, res, fromDate, toDate, preset) {
        const user = req.user;
        const isSuperAdmin = user.role === 'SUPER_ADMIN' || user.isSuperAdmin;
        try {
            const customer = await this.queryBus.execute(new get_customer_by_id_query_1.GetCustomerByIdQuery(id, user.companyId));
            if (!isSuperAdmin && customer.garageId && !user.garageIds?.includes(customer.garageId)) {
                return res.redirect('/customers?error=You+do+not+have+permission+to+view+this+customer');
            }
            let bills = customer.bills || [];
            const totalAllBillsCount = bills.length;
            let effectiveFromDate = fromDate;
            let effectiveToDate = toDate;
            if (preset && !fromDate && !toDate) {
                const now = new Date();
                const pad = (n) => String(n).padStart(2, '0');
                const fmt = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
                const todayStr = fmt(now);
                switch (preset) {
                    case 'today':
                        effectiveFromDate = todayStr;
                        effectiveToDate = todayStr;
                        break;
                    case 'thisMonth':
                        effectiveFromDate = fmt(new Date(now.getFullYear(), now.getMonth(), 1));
                        effectiveToDate = todayStr;
                        break;
                    case 'lastMonth': {
                        const lm = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                        effectiveFromDate = fmt(lm);
                        effectiveToDate = fmt(new Date(now.getFullYear(), now.getMonth(), 0));
                        break;
                    }
                    case 'last30': {
                        const d = new Date(now);
                        d.setDate(d.getDate() - 30);
                        effectiveFromDate = fmt(d);
                        effectiveToDate = todayStr;
                        break;
                    }
                    case 'thisYear':
                        effectiveFromDate = `${now.getFullYear()}-01-01`;
                        effectiveToDate = todayStr;
                        break;
                }
            }
            const sortedAllBills = [...(customer.bills || [])].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            const actualLatestBillId = sortedAllBills.length > 0 ? sortedAllBills[0].id : null;
            if (effectiveFromDate) {
                const fromTime = new Date(`${effectiveFromDate}T00:00:00`).getTime();
                bills = bills.filter((b) => new Date(b.date).getTime() >= fromTime);
            }
            if (effectiveToDate) {
                const toTime = new Date(`${effectiveToDate}T23:59:59.999`).getTime();
                bills = bills.filter((b) => new Date(b.date).getTime() <= toTime);
            }
            bills.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            bills = bills.map((b) => ({
                ...b,
                isLatestBill: b.id === actualLatestBillId,
            }));
            let periodUnits = 0;
            let periodBilled = 0;
            let periodPaid = 0;
            for (const b of bills) {
                periodUnits += b.totalUnit || 0;
                periodBilled += b.totalBill || 0;
                periodPaid += b.clearMoney || 0;
            }
            return res.render('customers/details', {
                title: `Customer: ${customer.name} - EGMS Portal`,
                activeNav: 'customers',
                user,
                isSuperAdmin,
                canCreate: isSuperAdmin || Boolean(user.canCreate),
                canEdit: isSuperAdmin || Boolean(user.canEdit),
                canDelete: isSuperAdmin || Boolean(user.canDelete),
                customer,
                bills,
                totalBillsCount: totalAllBillsCount,
                totalFilteredBillsCount: bills.length,
                periodSummary: {
                    units: periodUnits,
                    billed: periodBilled,
                    paid: periodPaid,
                },
                fromDate: effectiveFromDate || '',
                toDate: effectiveToDate || '',
                preset: preset || '',
            });
        }
        catch {
            return res.redirect('/customers');
        }
    }
    async renderEditForm(id, req, res) {
        const user = req.user;
        const isSuperAdmin = user.role === 'SUPER_ADMIN' || user.isSuperAdmin;
        const allowedGarageIds = isSuperAdmin ? null : (user.garageIds || []);
        try {
            const customer = await this.queryBus.execute(new get_customer_by_id_query_1.GetCustomerByIdQuery(id, user.companyId));
            if (!isSuperAdmin && customer.garageId && !user.garageIds?.includes(customer.garageId)) {
                return res.redirect('/customers?error=You+do+not+have+permission+to+edit+this+customer');
            }
            const garages = await this.queryBus.execute(new get_garages_by_company_query_1.GetGaragesByCompanyQuery(user.companyId, allowedGarageIds));
            return res.render('customers/edit', {
                title: `Edit Customer: ${customer.name} - EGMS Portal`,
                activeNav: 'customers',
                user,
                customer,
                garages,
                selectedGarageId: customer.garageId || '',
            });
        }
        catch {
            return res.redirect('/customers');
        }
    }
    async handleUpdate(id, dto, files, req, res) {
        const user = req.user;
        const isSuperAdmin = user.role === 'SUPER_ADMIN' || user.isSuperAdmin;
        const allowedGarageIds = isSuperAdmin ? null : (user.garageIds || []);
        try {
            const existing = await this.queryBus.execute(new get_customer_by_id_query_1.GetCustomerByIdQuery(id, user.companyId));
            if (!isSuperAdmin && existing.garageId && !user.garageIds?.includes(existing.garageId)) {
                return res.redirect('/customers?error=You+do+not+have+permission+to+edit+this+customer');
            }
            let existingDocs = existing.documents ? [...existing.documents] : [];
            if (dto.removeAvatar === 'true' || (req.body && req.body.removeAvatar === 'true')) {
                existingDocs = existingDocs.filter((d) => d.tag !== 'PHOTO' && d.tag !== 'AVATAR');
            }
            const avatarFile = (files || []).find((f) => f.fieldname === 'avatarFile' || f.fieldname === 'profilePicture');
            if (avatarFile && avatarFile.buffer && avatarFile.buffer.length > 0) {
                try {
                    const uploadedPhoto = await this.fileService.uploadFile(avatarFile, 'customers', 'PHOTO', `${user.sub || user.companyId}|${user.role || 'SUPER_ADMIN'}`);
                    existingDocs = existingDocs.filter((d) => d.tag !== 'PHOTO' && d.tag !== 'AVATAR');
                    existingDocs.unshift(uploadedPhoto);
                }
                catch (photoErr) {
                    console.warn('Customer avatar update failed:', photoErr?.message);
                }
            }
            const regularFiles = (files || []).filter((f) => f.fieldname === 'files');
            if (regularFiles.length > 0) {
                const uploadedDocs = await this.fileService.uploadFiles(regularFiles, 'customers', dto.documentType || 'GENERAL');
                existingDocs.push(...uploadedDocs);
            }
            dto.documents = existingDocs;
            await this.commandBus.execute(new update_customer_command_1.UpdateCustomerCommand(id, user.companyId, dto, `${user.sub || user.companyId}|${user.role || 'SUPER_ADMIN'}`));
            await this.auditLogService.record({
                companyId: user.companyId,
                userId: user.sub || user.companyId,
                userName: user.name,
                userRole: user.role,
                action: 'UPDATE',
                entityType: 'CUSTOMER',
                entityId: id,
                entityName: dto.name,
                details: `Updated customer profile ${dto.name} (${dto.customerCode || id})`,
                req,
            });
            return res.redirect(`/customers/${id}?success=msg.customerUpdated`);
        }
        catch (err) {
            const garages = await this.queryBus.execute(new get_garages_by_company_query_1.GetGaragesByCompanyQuery(user.companyId, allowedGarageIds));
            return res.render('customers/edit', {
                title: 'Edit Customer - EGMS Portal',
                activeNav: 'customers',
                user,
                customer: { id, ...dto },
                garages,
                selectedGarageId: dto.garageId || '',
                error: err.message || 'Failed to update customer.',
            });
        }
    }
    async handleDelete(id, req, res) {
        const user = req.user;
        const isSuperAdmin = user.role === 'SUPER_ADMIN' || user.isSuperAdmin;
        try {
            const existing = await this.queryBus.execute(new get_customer_by_id_query_1.GetCustomerByIdQuery(id, user.companyId));
            if (!isSuperAdmin && existing.garageId && !user.garageIds?.includes(existing.garageId)) {
                return res.redirect('/customers?error=You+do+not+have+permission+to+delete+this+customer');
            }
            await this.commandBus.execute(new delete_customer_command_1.DeleteCustomerCommand(id, user.companyId, `${user.sub || user.companyId}|${user.role || 'SUPER_ADMIN'}`));
            await this.auditLogService.record({
                companyId: user.companyId,
                userId: user.sub || user.companyId,
                userName: user.name,
                userRole: user.role,
                action: 'DELETE',
                entityType: 'CUSTOMER',
                entityId: id,
                entityName: existing?.name || id,
                details: `Deleted customer record ${existing?.name || id}`,
                req,
            });
            return res.redirect('/customers?success=msg.customerDeleted');
        }
        catch {
            return res.redirect('/customers?error=msg.customerDeleteFailed');
        }
    }
    async handleToggleStatus(id, req, res) {
        const user = req.user;
        const isSuperAdmin = user.role === 'SUPER_ADMIN' || user.isSuperAdmin;
        if (!isSuperAdmin) {
            const returnUrl = req.headers.referer || `/customers/${id}`;
            return res.redirect(`${returnUrl}${returnUrl.includes('?') ? '&' : '?'}error=msg.superAdminRequired`);
        }
        try {
            const result = await this.commandBus.execute(new toggle_customer_status_command_1.ToggleCustomerStatusCommand(id, user.companyId, `${user.sub || user.companyId}|${user.role || 'SUPER_ADMIN'}`));
            const customer = result.customer;
            const isSuspended = !result.isActive;
            await this.auditLogService.record({
                companyId: user.companyId,
                userId: user.sub || user.companyId,
                userName: user.name,
                userRole: user.role,
                action: 'UPDATE',
                entityType: 'CUSTOMER',
                entityId: id,
                entityName: customer.name,
                details: isSuspended
                    ? `Suspended customer account ${customer.name} (${customer.customerCode || customer.id})`
                    : `Reactivated customer account ${customer.name} (${customer.customerCode || customer.id})`,
                req,
            });
            const referer = req.headers.referer || '';
            let returnUrl = `/customers/${id}`;
            if (referer) {
                try {
                    const urlObj = new URL(referer);
                    urlObj.searchParams.delete('error');
                    urlObj.searchParams.delete('success');
                    returnUrl = urlObj.pathname + (urlObj.searchParams.toString() ? `?${urlObj.searchParams.toString()}` : '');
                }
                catch {
                    returnUrl = referer.split('?')[0];
                }
            }
            const msgKey = isSuspended ? 'msg.customerSuspended' : 'msg.customerReactivated';
            const separator = returnUrl.includes('?') ? '&' : '?';
            return res.redirect(`${returnUrl}${separator}success=${msgKey}`);
        }
        catch (err) {
            const returnUrl = req.headers.referer || `/customers/${id}`;
            const separator = returnUrl.includes('?') ? '&' : '?';
            return res.redirect(`${returnUrl}${separator}error=${encodeURIComponent(err.message || 'Operation failed')}`);
        }
    }
    async handleCreateGuarantor(customerId, dto, files, req, res) {
        const user = req.user;
        const isSuperAdmin = user.role === 'SUPER_ADMIN' || user.isSuperAdmin;
        try {
            const customer = await this.queryBus.execute(new get_customer_by_id_query_1.GetCustomerByIdQuery(customerId, user.companyId));
            if (!isSuperAdmin && customer.garageId && !user.garageIds?.includes(customer.garageId)) {
                return res.redirect(`/customers/${customerId}?error=You+do+not+have+permission+to+manage+this+customer`);
            }
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
            await this.commandBus.execute(new create_guarantor_command_1.CreateGuarantorCommand(user.companyId, customerId, dto, `${user.sub || user.companyId}|${user.role || 'SUPER_ADMIN'}`));
            return res.redirect(`/customers/${customerId}?success=msg.guarantorAdded`);
        }
        catch (err) {
            return res.redirect(`/customers/${customerId}?error=${encodeURIComponent(err.message || 'Failed to add guarantor')}`);
        }
    }
    async renderEditGuarantorForm(customerId, guarantorId, req, res) {
        const user = req.user;
        const isSuperAdmin = user.role === 'SUPER_ADMIN' || user.isSuperAdmin;
        try {
            const customer = await this.queryBus.execute(new get_customer_by_id_query_1.GetCustomerByIdQuery(customerId, user.companyId));
            if (!isSuperAdmin && customer.garageId && !user.garageIds?.includes(customer.garageId)) {
                return res.redirect('/customers?error=You+do+not+have+permission+to+edit+this+guarantor');
            }
            const guarantors = await this.queryBus.execute(new get_guarantors_by_customer_query_1.GetGuarantorsByCustomerQuery(customerId, user.companyId));
            const guarantor = guarantors.find((g) => g.id === guarantorId);
            if (!guarantor) {
                return res.redirect(`/customers/${customerId}?error=Guarantor+not+found`);
            }
            return res.render('customers/edit-guarantor', {
                title: `Edit Guarantor: ${guarantor.name} - EGMS Portal`,
                activeNav: 'customers',
                user,
                isSuperAdmin,
                customer,
                guarantor,
            });
        }
        catch {
            return res.redirect(`/customers/${customerId}`);
        }
    }
    async handleUpdateGuarantor(customerId, guarantorId, dto, files, req, res) {
        const user = req.user;
        const isSuperAdmin = user.role === 'SUPER_ADMIN' || user.isSuperAdmin;
        try {
            const customer = await this.queryBus.execute(new get_customer_by_id_query_1.GetCustomerByIdQuery(customerId, user.companyId));
            if (!isSuperAdmin && customer.garageId && !user.garageIds?.includes(customer.garageId)) {
                return res.redirect(`/customers/${customerId}?error=You+do+not+have+permission+to+edit+this+guarantor`);
            }
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
                const guarantors = await this.queryBus.execute(new get_guarantors_by_customer_query_1.GetGuarantorsByCustomerQuery(customerId, user.companyId));
                const currentGuarantor = guarantors.find((g) => g.id === guarantorId);
                const existingDocs = currentGuarantor?.documents || [];
                dto.documents = [...existingDocs, ...uploadedDocs];
            }
            await this.commandBus.execute(new update_guarantor_command_1.UpdateGuarantorCommand(user.companyId, customerId, guarantorId, dto, `${user.sub || user.companyId}|${user.role || 'SUPER_ADMIN'}`));
            return res.redirect(`/customers/${customerId}?success=msg.guarantorUpdated`);
        }
        catch (err) {
            return res.render('customers/edit-guarantor', {
                title: `Edit Guarantor - EGMS Portal`,
                activeNav: 'customers',
                user,
                isSuperAdmin,
                customer: { id: customerId },
                guarantor: { id: guarantorId, ...dto },
                error: err.message || 'Failed to update guarantor',
            });
        }
    }
    async handleDeleteGuarantor(customerId, guarantorId, req, res) {
        const user = req.user;
        const isSuperAdmin = user.role === 'SUPER_ADMIN' || user.isSuperAdmin;
        try {
            const customer = await this.queryBus.execute(new get_customer_by_id_query_1.GetCustomerByIdQuery(customerId, user.companyId));
            if (!isSuperAdmin && customer.garageId && !user.garageIds?.includes(customer.garageId)) {
                return res.redirect(`/customers/${customerId}?error=You+do+not+have+permission+to+delete+this+guarantor`);
            }
            await this.commandBus.execute(new delete_guarantor_command_1.DeleteGuarantorCommand(user.companyId, customerId, guarantorId, `${user.sub || user.companyId}|${user.role || 'SUPER_ADMIN'}`));
            return res.redirect(`/customers/${customerId}?success=msg.guarantorDeleted`);
        }
        catch (err) {
            return res.redirect(`/customers/${customerId}?error=${encodeURIComponent(err.message || 'Failed to delete guarantor')}`);
        }
    }
};
exports.CustomerController = CustomerController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __param(2, (0, common_1.Query)('search')),
    __param(3, (0, common_1.Query)('garageId')),
    __param(4, (0, common_1.Query)('fromDate')),
    __param(5, (0, common_1.Query)('toDate')),
    __param(6, (0, common_1.Query)('preset')),
    __param(7, (0, common_1.Query)('page')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], CustomerController.prototype, "listCustomers", null);
__decorate([
    (0, common_1.Get)('new'),
    (0, common_1.UseGuards)(permissions_guard_1.PermissionsGuard),
    (0, permissions_decorator_1.RequirePermissions)('canCreate'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __param(2, (0, common_1.Query)('garageId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String]),
    __metadata("design:returntype", Promise)
], CustomerController.prototype, "renderCreateForm", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(permissions_guard_1.PermissionsGuard),
    (0, permissions_decorator_1.RequirePermissions)('canCreate'),
    (0, common_1.UseInterceptors)((0, platform_express_1.AnyFilesInterceptor)({ limits: { fileSize: 25 * 1024 * 1024 } })),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFiles)()),
    __param(2, (0, common_1.Req)()),
    __param(3, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [customer_dto_1.CreateCustomerDto, Array, Object, Object]),
    __metadata("design:returntype", Promise)
], CustomerController.prototype, "handleCreate", null);
__decorate([
    (0, common_1.Get)('check-code'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __param(2, (0, common_1.Query)('code')),
    __param(3, (0, common_1.Query)('exclude')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String, String]),
    __metadata("design:returntype", Promise)
], CustomerController.prototype, "checkCustomerCode", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __param(3, (0, common_1.Query)('fromDate')),
    __param(4, (0, common_1.Query)('toDate')),
    __param(5, (0, common_1.Query)('preset')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, String, String, String]),
    __metadata("design:returntype", Promise)
], CustomerController.prototype, "renderDetails", null);
__decorate([
    (0, common_1.Get)(':id/edit'),
    (0, common_1.UseGuards)(permissions_guard_1.PermissionsGuard),
    (0, permissions_decorator_1.RequirePermissions)('canEdit'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], CustomerController.prototype, "renderEditForm", null);
__decorate([
    (0, common_1.Post)(':id/edit'),
    (0, common_1.UseGuards)(permissions_guard_1.PermissionsGuard),
    (0, permissions_decorator_1.RequirePermissions)('canEdit'),
    (0, common_1.UseInterceptors)((0, platform_express_1.AnyFilesInterceptor)({ limits: { fileSize: 25 * 1024 * 1024 } })),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.UploadedFiles)()),
    __param(3, (0, common_1.Req)()),
    __param(4, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, customer_dto_1.UpdateCustomerDto, Array, Object, Object]),
    __metadata("design:returntype", Promise)
], CustomerController.prototype, "handleUpdate", null);
__decorate([
    (0, common_1.Post)(':id/delete'),
    (0, common_1.UseGuards)(permissions_guard_1.PermissionsGuard),
    (0, permissions_decorator_1.RequirePermissions)('canDelete'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], CustomerController.prototype, "handleDelete", null);
__decorate([
    (0, common_1.Post)(':id/toggle-status'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], CustomerController.prototype, "handleToggleStatus", null);
__decorate([
    (0, common_1.Post)(':id/guarantors'),
    (0, common_1.UseGuards)(permissions_guard_1.PermissionsGuard),
    (0, permissions_decorator_1.RequirePermissions)('canCreate'),
    (0, common_1.UseInterceptors)((0, platform_express_1.AnyFilesInterceptor)({ limits: { fileSize: 25 * 1024 * 1024 } })),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.UploadedFiles)()),
    __param(3, (0, common_1.Req)()),
    __param(4, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, guarantor_dto_1.CreateGuarantorDto, Array, Object, Object]),
    __metadata("design:returntype", Promise)
], CustomerController.prototype, "handleCreateGuarantor", null);
__decorate([
    (0, common_1.Get)(':id/guarantors/:guarantorId/edit'),
    (0, common_1.UseGuards)(permissions_guard_1.PermissionsGuard),
    (0, permissions_decorator_1.RequirePermissions)('canEdit'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('guarantorId')),
    __param(2, (0, common_1.Req)()),
    __param(3, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, Object]),
    __metadata("design:returntype", Promise)
], CustomerController.prototype, "renderEditGuarantorForm", null);
__decorate([
    (0, common_1.Post)(':id/guarantors/:guarantorId'),
    (0, common_1.UseGuards)(permissions_guard_1.PermissionsGuard),
    (0, permissions_decorator_1.RequirePermissions)('canEdit'),
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
], CustomerController.prototype, "handleUpdateGuarantor", null);
__decorate([
    (0, common_1.Post)(':id/guarantors/:guarantorId/delete'),
    (0, common_1.UseGuards)(permissions_guard_1.PermissionsGuard),
    (0, permissions_decorator_1.RequirePermissions)('canDelete'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('guarantorId')),
    __param(2, (0, common_1.Req)()),
    __param(3, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, Object]),
    __metadata("design:returntype", Promise)
], CustomerController.prototype, "handleDeleteGuarantor", null);
exports.CustomerController = CustomerController = __decorate([
    (0, common_1.Controller)('customers'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(4, (0, common_1.Inject)(index_1.GUARANTOR_REPOSITORY_TOKEN)),
    __metadata("design:paramtypes", [cqrs_1.CommandBus,
        cqrs_1.QueryBus,
        audit_log_service_1.AuditLogService,
        file_service_1.FileService, Object])
], CustomerController);
//# sourceMappingURL=customer.controller.js.map