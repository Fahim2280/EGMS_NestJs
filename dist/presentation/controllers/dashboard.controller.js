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
exports.DashboardController = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const get_company_by_id_query_1 = require("../../application/queries/impl/get-company-by-id.query");
const get_garages_by_company_query_1 = require("../../application/queries/impl/get-garages-by-company.query");
const get_employees_by_company_query_1 = require("../../application/queries/impl/get-employees-by-company.query");
const get_dashboard_stats_query_1 = require("../../application/queries/impl/get-dashboard-stats.query");
const get_executive_dashboard_query_1 = require("../../application/queries/impl/get-executive-dashboard.query");
const jwt_auth_guard_1 = require("../../infrastructure/auth/jwt-auth.guard");
let DashboardController = class DashboardController {
    queryBus;
    constructor(queryBus) {
        this.queryBus = queryBus;
    }
    async renderDashboard(req, res) {
        const user = req.user;
        if (!user) {
            return res.redirect('/login');
        }
        const companyId = user.companyId;
        const isSuperAdmin = user.role === 'SUPER_ADMIN' || user.isSuperAdmin;
        const allowedGarageIds = isSuperAdmin ? null : (user.garageIds || []);
        const [company, garages, employees, stats, execDashboard] = await Promise.all([
            this.queryBus.execute(new get_company_by_id_query_1.GetCompanyByIdQuery(companyId)),
            this.queryBus.execute(new get_garages_by_company_query_1.GetGaragesByCompanyQuery(companyId, allowedGarageIds)),
            this.queryBus.execute(new get_employees_by_company_query_1.GetEmployeesByCompanyQuery(companyId)),
            this.queryBus.execute(new get_dashboard_stats_query_1.GetDashboardStatsQuery(companyId, allowedGarageIds)),
            this.queryBus.execute(new get_executive_dashboard_query_1.GetExecutiveDashboardQuery(companyId, allowedGarageIds)),
        ]);
        return res.render('dashboard', {
            title: `${company?.companyName || 'Dashboard'} - Electric Garage Portal`,
            activeNav: 'dashboard',
            user,
            isSuperAdmin,
            canCreate: isSuperAdmin || Boolean(user.canCreate),
            canEdit: isSuperAdmin || Boolean(user.canEdit),
            canDelete: isSuperAdmin || Boolean(user.canDelete),
            canView: isSuperAdmin || Boolean(user.canView),
            hasAssignedGarages: isSuperAdmin || (user.garageIds && user.garageIds.length > 0),
            company,
            garages,
            employees,
            stats,
            execDashboard,
            totalAdvanceMoney: execDashboard.totalAdvanceMoney,
            totalPresentDues: execDashboard.totalPresentDues,
            balance: execDashboard.balance,
            customerCount: execDashboard.customerCount,
            customersWithBills: execDashboard.customersWithBills,
            customersWithoutBills: execDashboard.customersWithoutBills,
            customers: execDashboard.customers,
        });
    }
    setLanguage(locale, req, res) {
        const lang = locale === 'bn' ? 'bn' : 'en';
        res.cookie('lang', lang, {
            maxAge: 365 * 24 * 60 * 60 * 1000,
            httpOnly: false,
            sameSite: 'lax',
        });
        const referer = req.get('Referrer') || '/';
        return res.redirect(referer);
    }
    setTheme(mode, req, res) {
        const theme = mode === 'light' ? 'light' : 'dark';
        res.cookie('theme', theme, {
            maxAge: 365 * 24 * 60 * 60 * 1000,
            httpOnly: false,
            sameSite: 'lax',
        });
        const referer = req.get('Referrer') || '/';
        return res.redirect(referer);
    }
};
exports.DashboardController = DashboardController;
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "renderDashboard", null);
__decorate([
    (0, common_1.Get)('lang/:locale'),
    __param(0, (0, common_1.Param)('locale')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], DashboardController.prototype, "setLanguage", null);
__decorate([
    (0, common_1.Get)('theme/:mode'),
    __param(0, (0, common_1.Param)('mode')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], DashboardController.prototype, "setTheme", null);
exports.DashboardController = DashboardController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [cqrs_1.QueryBus])
], DashboardController);
//# sourceMappingURL=dashboard.controller.js.map