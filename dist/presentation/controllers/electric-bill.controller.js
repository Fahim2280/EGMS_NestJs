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
exports.ElectricBillController = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const electric_bill_dto_1 = require("../../application/dtos/electric-bill.dto");
const create_electric_bill_command_1 = require("../../application/commands/impl/create-electric-bill.command");
const update_electric_bill_command_1 = require("../../application/commands/impl/update-electric-bill.command");
const delete_electric_bill_command_1 = require("../../application/commands/impl/delete-electric-bill.command");
const generate_monthly_bills_command_1 = require("../../application/commands/impl/generate-monthly-bills.command");
const get_electric_bills_by_company_query_1 = require("../../application/queries/impl/get-electric-bills-by-company.query");
const get_electric_bill_by_id_query_1 = require("../../application/queries/impl/get-electric-bill-by-id.query");
const get_customers_by_company_query_1 = require("../../application/queries/impl/get-customers-by-company.query");
const get_customer_by_id_query_1 = require("../../application/queries/impl/get-customer-by-id.query");
const get_customer_bill_summary_query_1 = require("../../application/queries/impl/get-customer-bill-summary.query");
const preview_electric_bill_query_1 = require("../../application/queries/impl/preview-electric-bill.query");
const get_company_by_id_query_1 = require("../../application/queries/impl/get-company-by-id.query");
const get_garages_by_company_query_1 = require("../../application/queries/impl/get-garages-by-company.query");
const jwt_auth_guard_1 = require("../../infrastructure/auth/jwt-auth.guard");
const permissions_guard_1 = require("../../infrastructure/auth/permissions.guard");
const permissions_decorator_1 = require("../../infrastructure/auth/permissions.decorator");
const audit_log_service_1 = require("../../application/services/audit-log.service");
let ElectricBillController = class ElectricBillController {
    commandBus;
    queryBus;
    auditLogService;
    constructor(commandBus, queryBus, auditLogService) {
        this.commandBus = commandBus;
        this.queryBus = queryBus;
        this.auditLogService = auditLogService;
    }
    async listBills(req, res, fromDate, toDate, garageId, search, preset, page) {
        const user = req.user;
        const isSuperAdmin = user.role === 'SUPER_ADMIN' || user.isSuperAdmin;
        const allowedGarageIds = isSuperAdmin ? null : (user.garageIds || []);
        const currentPage = Math.max(1, parseInt(page || '1', 10));
        const pageSize = 15;
        const parsedFromDate = fromDate ? new Date(fromDate) : undefined;
        const parsedToDate = toDate ? new Date(toDate) : undefined;
        const [bills, garages] = await Promise.all([
            this.queryBus.execute(new get_electric_bills_by_company_query_1.GetElectricBillsByCompanyQuery(user.companyId, allowedGarageIds, parsedFromDate, parsedToDate, garageId, search)),
            this.queryBus.execute(new get_garages_by_company_query_1.GetGaragesByCompanyQuery(user.companyId, allowedGarageIds)),
        ]);
        let totalUnits = 0;
        let totalElectric = 0;
        let totalBilled = 0;
        let totalPaid = 0;
        let totalDues = 0;
        for (const b of bills) {
            totalUnits += b.totalUnit || 0;
            totalElectric += b.electricBill || 0;
            totalBilled += b.totalBill || 0;
            totalPaid += b.clearMoney || 0;
            totalDues += b.presentDues || 0;
        }
        const summary = {
            totalUnits,
            totalElectric,
            totalBilled,
            totalPaid,
            totalDues,
        };
        const totalCount = bills.length;
        const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
        const safePage = Math.min(currentPage, totalPages);
        const paginated = bills.slice((safePage - 1) * pageSize, safePage * pageSize);
        const now = new Date();
        const defaultFromDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        const defaultToDate = now.toISOString().split('T')[0];
        return res.render('bills/index', {
            title: 'Electric Bills Ledger - EGMS Portal',
            activeNav: 'bills',
            user,
            isSuperAdmin,
            canCreate: isSuperAdmin || Boolean(user.canCreate),
            canEdit: isSuperAdmin || Boolean(user.canEdit),
            canDelete: isSuperAdmin || Boolean(user.canDelete),
            canView: isSuperAdmin || Boolean(user.canView),
            bills: paginated,
            totalBillsCount: totalCount,
            garages,
            selectedGarageId: garageId || '',
            fromDate: fromDate || '',
            toDate: toDate || '',
            search: search || '',
            preset: preset || '',
            summary,
            defaultFromDate,
            defaultToDate,
            todayDate: defaultToDate,
            pagination: {
                page: safePage,
                totalPages,
                totalCount,
                hasNext: safePage < totalPages,
                hasPrev: safePage > 1,
            },
        });
    }
    async renderCreateForm(customerId, req, res) {
        const user = req.user;
        const isSuperAdmin = user.role === 'SUPER_ADMIN' || user.isSuperAdmin;
        const allowedGarageIds = isSuperAdmin ? null : (user.garageIds || []);
        const [customers, company] = await Promise.all([
            this.queryBus.execute(new get_customers_by_company_query_1.GetCustomersByCompanyQuery(user.companyId, allowedGarageIds)),
            this.queryBus.execute(new get_company_by_id_query_1.GetCompanyByIdQuery(user.companyId)).catch(() => null),
        ]);
        let preselectedCustomer = null;
        let initialSummary = null;
        if (customerId) {
            preselectedCustomer = customers.find((c) => c.id === customerId);
            if (preselectedCustomer) {
                try {
                    initialSummary = await this.queryBus.execute(new get_customer_bill_summary_query_1.GetCustomerBillSummaryQuery(customerId, user.companyId));
                }
                catch {
                }
            }
        }
        return res.render('bills/create', {
            title: 'Generate Electric Bill - Garage Portal',
            activeNav: 'bills',
            user,
            customers,
            preselectedCustomerId: customerId,
            initialSummary,
            defaultUnitRate: company?.unitRate || 15,
            todayDate: new Date().toISOString().split('T')[0],
        });
    }
    async handleCreate(dto, req, res) {
        const user = req.user;
        if (!user)
            return res.redirect('/login');
        const isSuperAdmin = user.role === 'SUPER_ADMIN' || user.isSuperAdmin;
        const allowedGarageIds = isSuperAdmin ? null : (user.garageIds || []);
        if (!isSuperAdmin) {
            try {
                const targetCustomer = await this.queryBus.execute(new get_customer_by_id_query_1.GetCustomerByIdQuery(dto.customerId, user.companyId));
                if (targetCustomer?.garageId && !user.garageIds?.includes(targetCustomer.garageId)) {
                    const [customers, company] = await Promise.all([
                        this.queryBus.execute(new get_customers_by_company_query_1.GetCustomersByCompanyQuery(user.companyId, allowedGarageIds)),
                        this.queryBus.execute(new get_company_by_id_query_1.GetCompanyByIdQuery(user.companyId)).catch(() => null),
                    ]);
                    return res.render('bills/create', {
                        title: 'Generate Electric Bill - Garage Portal',
                        activeNav: 'bills',
                        user,
                        customers,
                        error: 'You do not have permission to generate bills for customers in this garage.',
                        formData: dto,
                        defaultUnitRate: company?.unitRate || 15,
                        todayDate: dto.date || new Date().toISOString().split('T')[0],
                    });
                }
            }
            catch {
            }
        }
        try {
            await this.commandBus.execute(new create_electric_bill_command_1.CreateElectricBillCommand(user.companyId, dto, `${user.sub || user.companyId}|${user.role || 'SUPER_ADMIN'}`));
            await this.auditLogService.record({
                companyId: user.companyId,
                userId: user.sub || user.companyId,
                userName: user.name,
                userRole: user.role,
                action: 'CREATE',
                entityType: 'ELECTRIC_BILL',
                details: `Generated electric bill for customer ${dto.customerId} (meter reading: ${dto.currentUnit})`,
                req,
            });
            return res.redirect('/bills?success=msg.billCreated');
        }
        catch (err) {
            const [customers, company] = await Promise.all([
                this.queryBus.execute(new get_customers_by_company_query_1.GetCustomersByCompanyQuery(user.companyId, allowedGarageIds)),
                this.queryBus.execute(new get_company_by_id_query_1.GetCompanyByIdQuery(user.companyId)).catch(() => null),
            ]);
            return res.render('bills/create', {
                title: 'Generate Electric Bill - Garage Portal',
                activeNav: 'bills',
                user,
                customers,
                error: err.message || 'Failed to generate electric bill.',
                formData: dto,
                defaultUnitRate: company?.unitRate || 15,
                todayDate: dto.date || new Date().toISOString().split('T')[0],
            });
        }
    }
    async renderDetails(id, req, res) {
        const user = req.user;
        if (!user)
            return res.redirect('/login');
        const isSuperAdmin = user.role === 'SUPER_ADMIN' || user.isSuperAdmin;
        try {
            const bill = await this.queryBus.execute(new get_electric_bill_by_id_query_1.GetElectricBillByIdQuery(id, user.companyId));
            if (!isSuperAdmin) {
                const customer = await this.queryBus.execute(new get_customer_by_id_query_1.GetCustomerByIdQuery(bill.customerId, user.companyId));
                if (customer?.garageId && !user.garageIds?.includes(customer.garageId)) {
                    return res.redirect('/bills?error=You+do+not+have+permission+to+view+this+bill');
                }
            }
            return res.render('bills/details', {
                title: `Bill Receipt #${bill.billNumber || bill.id.substring(0, 8)} - Garage Portal`,
                activeNav: 'bills',
                user,
                isSuperAdmin,
                canCreate: isSuperAdmin || Boolean(user.canCreate),
                canEdit: isSuperAdmin || Boolean(user.canEdit),
                canDelete: isSuperAdmin || Boolean(user.canDelete),
                bill,
            });
        }
        catch {
            return res.redirect('/bills');
        }
    }
    async renderEditForm(id, req, res) {
        const user = req.user;
        if (!user)
            return res.redirect('/login');
        const isSuperAdmin = user.role === 'SUPER_ADMIN' || user.isSuperAdmin;
        const allowedGarageIds = isSuperAdmin ? null : (user.garageIds || []);
        try {
            const bill = await this.queryBus.execute(new get_electric_bill_by_id_query_1.GetElectricBillByIdQuery(id, user.companyId));
            if (!isSuperAdmin) {
                const customer = await this.queryBus.execute(new get_customer_by_id_query_1.GetCustomerByIdQuery(bill.customerId, user.companyId));
                if (customer?.garageId && !user.garageIds?.includes(customer.garageId)) {
                    return res.redirect('/bills?error=You+do+not+have+permission+to+edit+this+bill');
                }
            }
            const customers = await this.queryBus.execute(new get_customers_by_company_query_1.GetCustomersByCompanyQuery(user.companyId, allowedGarageIds));
            return res.render('bills/edit', {
                title: `Edit Electric Bill #${bill.billNumber || bill.id.substring(0, 8)} - Garage Portal`,
                activeNav: 'bills',
                user,
                bill,
                customers,
                billDateStr: new Date(bill.date).toISOString().split('T')[0],
            });
        }
        catch {
            return res.redirect('/bills');
        }
    }
    async handleUpdate(id, dto, req, res) {
        const user = req.user;
        if (!user)
            return res.redirect('/login');
        const isSuperAdmin = user.role === 'SUPER_ADMIN' || user.isSuperAdmin;
        const allowedGarageIds = isSuperAdmin ? null : (user.garageIds || []);
        try {
            const existing = await this.queryBus.execute(new get_electric_bill_by_id_query_1.GetElectricBillByIdQuery(id, user.companyId));
            if (!isSuperAdmin) {
                const customer = await this.queryBus.execute(new get_customer_by_id_query_1.GetCustomerByIdQuery(existing.customerId, user.companyId));
                if (customer?.garageId && !user.garageIds?.includes(customer.garageId)) {
                    return res.redirect('/bills?error=You+do+not+have+permission+to+edit+this+bill');
                }
            }
            dto.id = id;
            await this.commandBus.execute(new update_electric_bill_command_1.UpdateElectricBillCommand(id, user.companyId, dto, `${user.sub || user.companyId}|${user.role || 'SUPER_ADMIN'}`));
            await this.auditLogService.record({
                companyId: user.companyId,
                userId: user.sub || user.companyId,
                userName: user.name,
                userRole: user.role,
                action: 'UPDATE',
                entityType: 'ELECTRIC_BILL',
                entityId: id,
                details: `Updated electric bill #${id}`,
                req,
            });
            return res.redirect(`/bills/${id}?success=msg.billUpdated`);
        }
        catch (err) {
            const bill = await this.queryBus.execute(new get_electric_bill_by_id_query_1.GetElectricBillByIdQuery(id, user.companyId));
            const customers = await this.queryBus.execute(new get_customers_by_company_query_1.GetCustomersByCompanyQuery(user.companyId, allowedGarageIds));
            return res.render('bills/edit', {
                title: 'Edit Electric Bill - Garage Portal',
                activeNav: 'bills',
                user,
                bill: { ...bill, ...dto },
                customers,
                error: err.message || 'Failed to update electric bill.',
            });
        }
    }
    async handleDelete(id, req, res) {
        const user = req.user;
        if (!user)
            return res.redirect('/login');
        const isSuperAdmin = user.role === 'SUPER_ADMIN' || user.isSuperAdmin;
        try {
            const existing = await this.queryBus.execute(new get_electric_bill_by_id_query_1.GetElectricBillByIdQuery(id, user.companyId));
            if (!isSuperAdmin) {
                const customer = await this.queryBus.execute(new get_customer_by_id_query_1.GetCustomerByIdQuery(existing.customerId, user.companyId));
                if (customer?.garageId && !user.garageIds?.includes(customer.garageId)) {
                    return res.redirect('/bills?error=msg.permissionDenied');
                }
            }
            await this.commandBus.execute(new delete_electric_bill_command_1.DeleteElectricBillCommand(id, user.companyId, `${user.sub || user.companyId}|${user.role || 'SUPER_ADMIN'}`));
            await this.auditLogService.record({
                companyId: user.companyId,
                userId: user.sub || user.companyId,
                userName: user.name,
                userRole: user.role,
                action: 'DELETE',
                entityType: 'ELECTRIC_BILL',
                entityId: id,
                details: `Deleted electric bill #${id}`,
                req,
            });
        }
        catch (err) {
            return res.redirect(`/bills?error=${encodeURIComponent(err.message || 'Failed to delete electric bill.')}`);
        }
    }
    async handleGenerateMonthly(fromDateStr, toDateStr, targetDateStr, req, res) {
        const user = req.user;
        if (!user)
            return res.redirect('/login');
        const toDate = toDateStr
            ? new Date(toDateStr)
            : targetDateStr
                ? new Date(targetDateStr)
                : new Date();
        const fromDate = fromDateStr
            ? new Date(fromDateStr)
            : new Date(toDate.getFullYear(), toDate.getMonth(), 1);
        await this.commandBus.execute(new generate_monthly_bills_command_1.GenerateMonthlyBillsCommand(user.companyId, toDate, `${user.sub || user.companyId}|${user.role || 'SUPER_ADMIN'}`, fromDate));
        await this.auditLogService.record({
            companyId: user.companyId,
            userId: user.sub || user.companyId,
            userName: user.name,
            userRole: user.role,
            action: 'CREATE',
            entityType: 'ELECTRIC_BILL',
            details: `Generated monthly electric bills for all eligible customers`,
            req,
        });
        return res.redirect('/bills?success=msg.billsBatchGenerated');
    }
    async getCustomerSummary(customerId, req, res) {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }
        try {
            const summary = await this.queryBus.execute(new get_customer_bill_summary_query_1.GetCustomerBillSummaryQuery(customerId, user.companyId));
            return res.json({ success: true, data: summary });
        }
        catch (err) {
            return res.status(404).json({ success: false, message: err.message });
        }
    }
    async previewBill(dto, req, res) {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }
        try {
            const preview = await this.queryBus.execute(new preview_electric_bill_query_1.PreviewElectricBillQuery(dto.customerId, user.companyId, Number(dto.currentMeterReading) || 0, Number(dto.rentBill) || 0, Number(dto.loan) || 0, dto.unitRate !== undefined && dto.unitRate !== null ? Number(dto.unitRate) : undefined));
            return res.json({ success: true, data: preview });
        }
        catch (err) {
            return res.status(400).json({ success: false, message: err.message });
        }
    }
};
exports.ElectricBillController = ElectricBillController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __param(2, (0, common_1.Query)('fromDate')),
    __param(3, (0, common_1.Query)('toDate')),
    __param(4, (0, common_1.Query)('garageId')),
    __param(5, (0, common_1.Query)('search')),
    __param(6, (0, common_1.Query)('preset')),
    __param(7, (0, common_1.Query)('page')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], ElectricBillController.prototype, "listBills", null);
__decorate([
    (0, common_1.Get)('new'),
    (0, common_1.UseGuards)(permissions_guard_1.PermissionsGuard),
    (0, permissions_decorator_1.RequirePermissions)('canCreate'),
    __param(0, (0, common_1.Query)('customerId')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], ElectricBillController.prototype, "renderCreateForm", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(permissions_guard_1.PermissionsGuard),
    (0, permissions_decorator_1.RequirePermissions)('canCreate'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [electric_bill_dto_1.CreateElectricBillDto, Object, Object]),
    __metadata("design:returntype", Promise)
], ElectricBillController.prototype, "handleCreate", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], ElectricBillController.prototype, "renderDetails", null);
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
], ElectricBillController.prototype, "renderEditForm", null);
__decorate([
    (0, common_1.Post)(':id/edit'),
    (0, common_1.UseGuards)(permissions_guard_1.PermissionsGuard),
    (0, permissions_decorator_1.RequirePermissions)('canEdit'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __param(3, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, electric_bill_dto_1.UpdateElectricBillDto, Object, Object]),
    __metadata("design:returntype", Promise)
], ElectricBillController.prototype, "handleUpdate", null);
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
], ElectricBillController.prototype, "handleDelete", null);
__decorate([
    (0, common_1.Post)('generate-monthly'),
    (0, common_1.UseGuards)(permissions_guard_1.PermissionsGuard),
    (0, permissions_decorator_1.RequirePermissions)('canCreate'),
    __param(0, (0, common_1.Body)('fromDate')),
    __param(1, (0, common_1.Body)('toDate')),
    __param(2, (0, common_1.Body)('targetDate')),
    __param(3, (0, common_1.Req)()),
    __param(4, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object, Object]),
    __metadata("design:returntype", Promise)
], ElectricBillController.prototype, "handleGenerateMonthly", null);
__decorate([
    (0, common_1.Get)('api/customer-summary/:customerId'),
    __param(0, (0, common_1.Param)('customerId')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], ElectricBillController.prototype, "getCustomerSummary", null);
__decorate([
    (0, common_1.Post)('api/preview'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [electric_bill_dto_1.PreviewBillRequestDto, Object, Object]),
    __metadata("design:returntype", Promise)
], ElectricBillController.prototype, "previewBill", null);
exports.ElectricBillController = ElectricBillController = __decorate([
    (0, common_1.Controller)('bills'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [cqrs_1.CommandBus,
        cqrs_1.QueryBus,
        audit_log_service_1.AuditLogService])
], ElectricBillController);
//# sourceMappingURL=electric-bill.controller.js.map