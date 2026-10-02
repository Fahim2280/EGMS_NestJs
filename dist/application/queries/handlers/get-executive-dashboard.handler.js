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
exports.GetExecutiveDashboardHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const get_executive_dashboard_query_1 = require("../impl/get-executive-dashboard.query");
const index_1 = require("../../../domain/index");
let GetExecutiveDashboardHandler = class GetExecutiveDashboardHandler {
    customerRepo;
    billRepo;
    garageRepo;
    constructor(customerRepo, billRepo, garageRepo) {
        this.customerRepo = customerRepo;
        this.billRepo = billRepo;
        this.garageRepo = garageRepo;
    }
    async execute(query) {
        let customers = await this.customerRepo.findByCompanyId(query.companyId);
        if (query.allowedGarageIds !== undefined && query.allowedGarageIds !== null) {
            const allowedSet = new Set(query.allowedGarageIds);
            customers = customers.filter((c) => c.garageId && allowedSet.has(c.garageId));
        }
        const garageStatusMap = new Map();
        if (this.garageRepo) {
            const garages = await this.garageRepo.findByCompanyId(query.companyId);
            for (const g of garages) {
                garageStatusMap.set(g.id, g.isActive === false);
            }
        }
        let totalAdvanceMoney = 0;
        let totalPresentDues = 0;
        let customersWithBills = 0;
        const dashboardList = [];
        for (const customer of customers) {
            const latestBill = await this.billRepo.findLatestByCustomerId(customer.id);
            const customerAdvanceMoney = Number(customer.advanceMoney) || 0;
            totalAdvanceMoney += customerAdvanceMoney;
            const customerPresentDues = latestBill
                ? Number(latestBill.presentDues)
                : customerAdvanceMoney;
            totalPresentDues += customerPresentDues;
            if (latestBill) {
                customersWithBills++;
            }
            dashboardList.push({
                id: customer.id,
                cId: customer.cId,
                customerCode: customer.customerCode,
                name: customer.name,
                mobileNumber: customer.mobileNumber,
                advanceMoney: customerAdvanceMoney,
                presentDues: customerPresentDues,
                garageId: customer.garageId,
                garageName: customer.garageName,
                isActive: customer.isActive,
                isGarageSuspended: customer.garageId
                    ? garageStatusMap.get(customer.garageId) ?? false
                    : false,
                lastBillDate: latestBill ? latestBill.date : customer.createdDate,
                hasBills: Boolean(latestBill),
            });
        }
        const balance = totalAdvanceMoney - totalPresentDues;
        dashboardList.sort((a, b) => new Date(b.lastBillDate).getTime() - new Date(a.lastBillDate).getTime());
        return {
            totalAdvanceMoney,
            totalPresentDues,
            balance,
            customerCount: customers.length,
            customersWithBills,
            customersWithoutBills: customers.length - customersWithBills,
            customers: dashboardList,
        };
    }
};
exports.GetExecutiveDashboardHandler = GetExecutiveDashboardHandler;
exports.GetExecutiveDashboardHandler = GetExecutiveDashboardHandler = __decorate([
    (0, cqrs_1.QueryHandler)(get_executive_dashboard_query_1.GetExecutiveDashboardQuery),
    __param(0, (0, common_1.Inject)(index_1.CUSTOMER_REPOSITORY_TOKEN)),
    __param(1, (0, common_1.Inject)(index_1.ELECTRIC_BILL_REPOSITORY_TOKEN)),
    __param(2, (0, common_1.Optional)()),
    __param(2, (0, common_1.Inject)(index_1.GARAGE_REPOSITORY_TOKEN)),
    __metadata("design:paramtypes", [Object, Object, Object])
], GetExecutiveDashboardHandler);
//# sourceMappingURL=get-executive-dashboard.handler.js.map