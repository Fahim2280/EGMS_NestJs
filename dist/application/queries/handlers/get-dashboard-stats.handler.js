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
exports.GetDashboardStatsHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const get_dashboard_stats_query_1 = require("../impl/get-dashboard-stats.query");
const index_1 = require("../../../domain/index");
let GetDashboardStatsHandler = class GetDashboardStatsHandler {
    companyRepo;
    garageRepo;
    employeeRepo;
    constructor(companyRepo, garageRepo, employeeRepo) {
        this.companyRepo = companyRepo;
        this.garageRepo = garageRepo;
        this.employeeRepo = employeeRepo;
    }
    async execute(query) {
        const totalCompanies = await this.companyRepo.count();
        const totalGarages = await this.garageRepo.count();
        const totalEmployees = await this.employeeRepo.count();
        let companyGaragesCount = 0;
        let companyEmployeesCount = 0;
        if (query.companyId) {
            let companyGarages = await this.garageRepo.findByCompanyId(query.companyId);
            if (query.allowedGarageIds !== undefined && query.allowedGarageIds !== null) {
                const allowedSet = new Set(query.allowedGarageIds);
                companyGarages = companyGarages.filter((g) => allowedSet.has(g.id));
            }
            companyGaragesCount = companyGarages.length;
            companyEmployeesCount = await this.employeeRepo.countByCompanyId(query.companyId);
        }
        return {
            totalCompanies,
            totalGarages,
            totalEmployees,
            companyGaragesCount,
            companyEmployeesCount,
        };
    }
};
exports.GetDashboardStatsHandler = GetDashboardStatsHandler;
exports.GetDashboardStatsHandler = GetDashboardStatsHandler = __decorate([
    (0, cqrs_1.QueryHandler)(get_dashboard_stats_query_1.GetDashboardStatsQuery),
    __param(0, (0, common_1.Inject)(index_1.COMPANY_REPOSITORY_TOKEN)),
    __param(1, (0, common_1.Inject)(index_1.GARAGE_REPOSITORY_TOKEN)),
    __param(2, (0, common_1.Inject)(index_1.EMPLOYEE_REPOSITORY_TOKEN)),
    __metadata("design:paramtypes", [Object, Object, Object])
], GetDashboardStatsHandler);
//# sourceMappingURL=get-dashboard-stats.handler.js.map