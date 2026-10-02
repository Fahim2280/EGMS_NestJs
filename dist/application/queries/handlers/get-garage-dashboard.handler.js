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
exports.GetGarageDashboardHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const nestjs_1 = require("@automapper/nestjs");
const get_garage_dashboard_query_1 = require("../impl/get-garage-dashboard.query");
const index_1 = require("../../../domain/index");
const garage_dto_1 = require("../../dtos/garage.dto");
let GetGarageDashboardHandler = class GetGarageDashboardHandler {
    garageRepo;
    companyRepo;
    customerRepo;
    billRepo;
    mapper;
    constructor(garageRepo, companyRepo, customerRepo, billRepo, mapper) {
        this.garageRepo = garageRepo;
        this.companyRepo = companyRepo;
        this.customerRepo = customerRepo;
        this.billRepo = billRepo;
        this.mapper = mapper;
    }
    async execute(query) {
        const { garageId, companyId } = query;
        const garage = await this.garageRepo.getByIdAsync(garageId);
        if (!garage || garage.companyId !== companyId) {
            throw new common_1.NotFoundException(`Garage with ID '${garageId}' was not found.`);
        }
        const company = await this.companyRepo.findById(companyId);
        const customers = await this.customerRepo.findByGarageId(companyId, garageId);
        const allBills = await this.billRepo.findByGarageId(companyId, garageId);
        let filteredBills = allBills;
        if (query.fromDate) {
            const fromTime = new Date(query.fromDate).setHours(0, 0, 0, 0);
            filteredBills = filteredBills.filter((b) => new Date(b.date).getTime() >= fromTime);
        }
        if (query.toDate) {
            const toTime = new Date(query.toDate).setHours(23, 59, 59, 999);
            filteredBills = filteredBills.filter((b) => new Date(b.date).getTime() <= toTime);
        }
        filteredBills.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        const totalCustomers = customers.length;
        let totalUnitsConsumed = 0;
        let totalElectricAmount = 0;
        let totalBilledAmount = 0;
        let totalCollectedRevenue = 0;
        let totalOutstandingDues = 0;
        for (const bill of filteredBills) {
            totalUnitsConsumed += bill.totalUnit || 0;
            totalElectricAmount += bill.electricBill || 0;
            totalBilledAmount += bill.totalBill || 0;
            totalCollectedRevenue += bill.clearMoney || 0;
            totalOutstandingDues += bill.presentDues || 0;
        }
        const averageUnitsPerCustomer = totalCustomers > 0 ? Math.round(totalUnitsConsumed / totalCustomers) : 0;
        const metrics = {
            totalCustomers,
            totalUnitsConsumed,
            totalElectricAmount,
            totalBilledAmount,
            totalCollectedRevenue,
            totalOutstandingDues,
            averageUnitsPerCustomer,
        };
        const customerMap = new Map(customers.map((c) => [c.id, c]));
        const latestBillIdByCustomer = new Map();
        for (const c of customers) {
            const cBills = allBills.filter((b) => b.customerId === c.id);
            if (cBills.length > 0) {
                cBills.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                latestBillIdByCustomer.set(c.id, cBills[0].id);
            }
        }
        const customerItems = customers.map((c) => {
            const latestBillId = latestBillIdByCustomer.get(c.id);
            const latestBill = latestBillId ? allBills.find((b) => b.id === latestBillId) : null;
            return {
                id: c.id,
                cId: c.cId,
                customerCode: c.customerCode,
                name: c.name,
                isActive: c.isActive,
                mobileNumber: c.mobileNumber,
                address: c.address,
                previousUnit: c.previousUnit,
                advanceMoney: c.advanceMoney,
                presentDues: latestBill ? latestBill.presentDues : 0,
                lastBillDate: latestBill ? latestBill.date : null,
                hasBills: !!latestBill,
                garageId: c.garageId,
                garageName: garage.garageName,
                documents: c.documents || [],
            };
        });
        const recentBills = filteredBills.slice(0, 20).map((b) => ({
            id: b.id,
            billNumber: b.billNumber,
            customerId: b.customerId,
            customerName: customerMap.get(b.customerId)?.name || 'Unknown',
            date: b.date,
            currentUnit: b.currentUnit,
            totalUnit: b.totalUnit,
            electricBill: b.electricBill,
            totalBill: b.totalBill,
            clearMoney: b.clearMoney,
            presentDues: b.presentDues,
            isLatestBill: latestBillIdByCustomer.get(b.customerId) === b.id,
        }));
        const garageDto = this.mapper.map(garage, index_1.Garage, garage_dto_1.GarageResponseDto);
        garageDto.companyName = company?.companyName;
        garageDto.customerCount = totalCustomers;
        return {
            garage: garageDto,
            metrics,
            customers: customerItems,
            recentBills,
            totalFilteredBillsCount: filteredBills.length,
            fromDate: query.fromDate ? new Date(query.fromDate).toISOString().split('T')[0] : undefined,
            toDate: query.toDate ? new Date(query.toDate).toISOString().split('T')[0] : undefined,
        };
    }
};
exports.GetGarageDashboardHandler = GetGarageDashboardHandler;
exports.GetGarageDashboardHandler = GetGarageDashboardHandler = __decorate([
    (0, cqrs_1.QueryHandler)(get_garage_dashboard_query_1.GetGarageDashboardQuery),
    __param(0, (0, common_1.Inject)(index_1.GARAGE_REPOSITORY_TOKEN)),
    __param(1, (0, common_1.Inject)(index_1.COMPANY_REPOSITORY_TOKEN)),
    __param(2, (0, common_1.Inject)(index_1.CUSTOMER_REPOSITORY_TOKEN)),
    __param(3, (0, common_1.Inject)(index_1.ELECTRIC_BILL_REPOSITORY_TOKEN)),
    __param(4, (0, nestjs_1.InjectMapper)()),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object])
], GetGarageDashboardHandler);
//# sourceMappingURL=get-garage-dashboard.handler.js.map