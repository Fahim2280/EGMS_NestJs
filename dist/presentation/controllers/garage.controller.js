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
exports.GarageController = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const garage_dto_1 = require("../../application/dtos/garage.dto");
const create_garage_command_1 = require("../../application/commands/impl/create-garage.command");
const update_garage_command_1 = require("../../application/commands/impl/update-garage.command");
const toggle_garage_status_command_1 = require("../../application/commands/impl/toggle-garage-status.command");
const get_garages_by_company_query_1 = require("../../application/queries/impl/get-garages-by-company.query");
const get_garage_by_id_query_1 = require("../../application/queries/impl/get-garage-by-id.query");
const get_garage_dashboard_query_1 = require("../../application/queries/impl/get-garage-dashboard.query");
const jwt_auth_guard_1 = require("../../infrastructure/auth/jwt-auth.guard");
const roles_guard_1 = require("../../infrastructure/auth/roles.guard");
const roles_decorator_1 = require("../../infrastructure/auth/roles.decorator");
const audit_log_service_1 = require("../../application/services/audit-log.service");
let GarageController = class GarageController {
    commandBus;
    queryBus;
    auditLogService;
    constructor(commandBus, queryBus, auditLogService) {
        this.commandBus = commandBus;
        this.queryBus = queryBus;
        this.auditLogService = auditLogService;
    }
    async listGarages(req, res, search, fromDate, toDate, preset) {
        const user = req.user;
        const isSuperAdmin = user.role === 'SUPER_ADMIN' || user.isSuperAdmin;
        const allowedGarageIds = isSuperAdmin ? null : (user.garageIds || []);
        let garages = await this.queryBus.execute(new get_garages_by_company_query_1.GetGaragesByCompanyQuery(user.companyId, allowedGarageIds));
        if (search && search.trim()) {
            const q = search.trim().toLowerCase();
            garages = garages.filter((g) => g.garageName?.toLowerCase().includes(q) ||
                g.address?.toLowerCase().includes(q));
        }
        if (fromDate) {
            const fromTime = new Date(fromDate).setHours(0, 0, 0, 0);
            garages = garages.filter((g) => {
                const d = g.createdDate || g.createdAt;
                return d && new Date(d).getTime() >= fromTime;
            });
        }
        if (toDate) {
            const toTime = new Date(toDate).setHours(23, 59, 59, 999);
            garages = garages.filter((g) => {
                const d = g.createdDate || g.createdAt;
                return d && new Date(d).getTime() <= toTime;
            });
        }
        return res.render('garages/index', {
            title: 'Company Garages - EGMS Portal',
            activeNav: 'garages',
            user,
            isSuperAdmin,
            canCreate: isSuperAdmin || Boolean(user.canCreate),
            canEdit: isSuperAdmin || Boolean(user.canEdit),
            canDelete: isSuperAdmin || Boolean(user.canDelete),
            canView: isSuperAdmin || Boolean(user.canView),
            garages,
            totalGaragesCount: garages.length,
            search: search || '',
            fromDate: fromDate || '',
            toDate: toDate || '',
            preset: preset || '',
        });
    }
    renderCreateForm(req, res) {
        const user = req.user;
        return res.render('garages/create', {
            title: 'Register New Garage - EGMS Portal',
            activeNav: 'garages',
            user,
        });
    }
    async handleCreate(req, dto, res) {
        const user = req.user;
        try {
            await this.commandBus.execute(new create_garage_command_1.CreateGarageCommand(user.companyId, dto));
            await this.auditLogService.record({
                companyId: user.companyId,
                userId: user.sub || user.companyId,
                userName: user.name,
                userRole: user.role,
                action: 'CREATE',
                entityType: 'GARAGE',
                entityName: dto.garageName,
                details: `Registered new garage facility: ${dto.garageName} located at ${dto.address || 'N/A'}`,
                req,
            });
            return res.redirect('/garages?success=msg.garageCreated');
        }
        catch (err) {
            return res.render('garages/create', {
                title: 'Register New Garage - EGMS Portal',
                activeNav: 'garages',
                user,
                error: err.message || 'Failed to create garage',
                formData: dto,
            });
        }
    }
    async renderDashboard(id, req, res, fromDate, toDate, preset, success) {
        const user = req.user;
        const isSuperAdmin = user.role === 'SUPER_ADMIN' || user.isSuperAdmin;
        if (!isSuperAdmin) {
            const allowed = user.garageIds && Array.isArray(user.garageIds) && user.garageIds.includes(id);
            if (!allowed) {
                return res.redirect('/garages?error=msg.permissionDenied');
            }
        }
        try {
            const parsedFromDate = fromDate ? new Date(fromDate) : undefined;
            const parsedToDate = toDate ? new Date(toDate) : undefined;
            const data = await this.queryBus.execute(new get_garage_dashboard_query_1.GetGarageDashboardQuery(id, user.companyId, parsedFromDate, parsedToDate));
            return res.render('garages/dashboard', {
                title: `${data.garage.garageName} - Garage Dashboard`,
                activeNav: 'garages',
                user,
                isSuperAdmin,
                canCreate: isSuperAdmin || Boolean(user.canCreate),
                canEdit: isSuperAdmin || Boolean(user.canEdit),
                canDelete: isSuperAdmin || Boolean(user.canDelete),
                garage: data.garage,
                metrics: data.metrics,
                customers: data.customers,
                recentBills: data.recentBills,
                totalFilteredBillsCount: data.totalFilteredBillsCount || data.recentBills.length,
                fromDate: fromDate || '',
                toDate: toDate || '',
                preset: preset || '',
                successMessage: success,
            });
        }
        catch (err) {
            return res.redirect('/garages?error=Garage+not+found');
        }
    }
    async renderEditForm(id, req, res) {
        const user = req.user;
        try {
            const garage = await this.queryBus.execute(new get_garage_by_id_query_1.GetGarageByIdQuery(id, user.companyId));
            return res.render('garages/edit', {
                title: `Edit Garage: ${garage.garageName} - EGMS Portal`,
                activeNav: 'garages',
                user,
                isSuperAdmin: user.role === 'SUPER_ADMIN' || user.isSuperAdmin,
                garage,
            });
        }
        catch {
            return res.redirect('/garages');
        }
    }
    async handleUpdate(id, dto, req, res) {
        const user = req.user;
        try {
            await this.commandBus.execute(new update_garage_command_1.UpdateGarageCommand(id, user.companyId, dto, `${user.sub || user.companyId}|${user.role || 'SUPER_ADMIN'}`));
            await this.auditLogService.record({
                companyId: user.companyId,
                userId: user.sub || user.companyId,
                userName: user.name,
                userRole: user.role,
                action: 'UPDATE',
                entityType: 'GARAGE',
                entityId: id,
                entityName: dto.garageName,
                details: `Updated garage facility: ${dto.garageName}`,
                req,
            });
            return res.redirect(`/garages/${id}?success=msg.garageUpdated`);
        }
        catch (err) {
            return res.render('garages/edit', {
                title: 'Edit Garage - EGMS Portal',
                activeNav: 'garages',
                user,
                isSuperAdmin: user.role === 'SUPER_ADMIN',
                garage: { id, ...dto },
                error: err.message || 'Failed to update garage',
            });
        }
    }
    async handleToggleStatus(id, req, res) {
        const user = req.user;
        const isSuperAdmin = user.role === 'SUPER_ADMIN' || user.isSuperAdmin;
        if (!isSuperAdmin) {
            const returnUrl = req.headers.referer || `/garages/${id}`;
            return res.redirect(`${returnUrl}${returnUrl.includes('?') ? '&' : '?'}error=msg.superAdminRequired`);
        }
        try {
            const result = await this.commandBus.execute(new toggle_garage_status_command_1.ToggleGarageStatusCommand(id, user.companyId, `${user.sub || user.companyId}|${user.role || 'SUPER_ADMIN'}`));
            const garage = result.garage;
            const isSuspended = !result.isActive;
            await this.auditLogService.record({
                companyId: user.companyId,
                userId: user.sub || user.companyId,
                userName: user.name,
                userRole: user.role,
                action: 'UPDATE',
                entityType: 'GARAGE',
                entityId: id,
                entityName: garage.garageName,
                details: isSuspended
                    ? `Suspended garage facility ${garage.garageName}`
                    : `Reactivated garage facility ${garage.garageName}`,
                req,
            });
            const referer = req.headers.referer || '';
            let returnUrl = `/garages/${id}`;
            if (referer) {
                try {
                    const urlObj = new URL(referer);
                    urlObj.searchParams.delete('error');
                    urlObj.searchParams.delete('success');
                    returnUrl =
                        urlObj.pathname +
                            (urlObj.searchParams.toString()
                                ? `?${urlObj.searchParams.toString()}`
                                : '');
                }
                catch {
                    returnUrl = referer.split('?')[0];
                }
            }
            const msgKey = isSuspended
                ? 'msg.garageSuspended'
                : 'msg.garageReactivated';
            const separator = returnUrl.includes('?') ? '&' : '?';
            return res.redirect(`${returnUrl}${separator}success=${msgKey}`);
        }
        catch (err) {
            const returnUrl = req.headers.referer || `/garages/${id}`;
            const separator = returnUrl.includes('?') ? '&' : '?';
            return res.redirect(`${returnUrl}${separator}error=${encodeURIComponent(err.message || 'Operation failed')}`);
        }
    }
};
exports.GarageController = GarageController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __param(2, (0, common_1.Query)('search')),
    __param(3, (0, common_1.Query)('fromDate')),
    __param(4, (0, common_1.Query)('toDate')),
    __param(5, (0, common_1.Query)('preset')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String, String, String, String]),
    __metadata("design:returntype", Promise)
], GarageController.prototype, "listGarages", null);
__decorate([
    (0, common_1.Get)('new'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('SUPER_ADMIN'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], GarageController.prototype, "renderCreateForm", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('SUPER_ADMIN'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, garage_dto_1.CreateGarageDto, Object]),
    __metadata("design:returntype", Promise)
], GarageController.prototype, "handleCreate", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __param(3, (0, common_1.Query)('fromDate')),
    __param(4, (0, common_1.Query)('toDate')),
    __param(5, (0, common_1.Query)('preset')),
    __param(6, (0, common_1.Query)('success')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, String, String, String, String]),
    __metadata("design:returntype", Promise)
], GarageController.prototype, "renderDashboard", null);
__decorate([
    (0, common_1.Get)(':id/edit'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('SUPER_ADMIN'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], GarageController.prototype, "renderEditForm", null);
__decorate([
    (0, common_1.Post)(':id/edit'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('SUPER_ADMIN'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __param(3, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, garage_dto_1.UpdateGarageDto, Object, Object]),
    __metadata("design:returntype", Promise)
], GarageController.prototype, "handleUpdate", null);
__decorate([
    (0, common_1.Post)(':id/toggle-status'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], GarageController.prototype, "handleToggleStatus", null);
exports.GarageController = GarageController = __decorate([
    (0, common_1.Controller)('garages'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [cqrs_1.CommandBus,
        cqrs_1.QueryBus,
        audit_log_service_1.AuditLogService])
], GarageController);
//# sourceMappingURL=garage.controller.js.map