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
exports.GetElectricBillsByCompanyHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const get_electric_bills_by_company_query_1 = require("../impl/get-electric-bills-by-company.query");
const index_1 = require("../../../domain/index");
let GetElectricBillsByCompanyHandler = class GetElectricBillsByCompanyHandler {
    billRepo;
    customerRepo;
    constructor(billRepo, customerRepo) {
        this.billRepo = billRepo;
        this.customerRepo = customerRepo;
    }
    async execute(query) {
        let [bills, customers] = await Promise.all([
            this.billRepo.findByCompanyId(query.companyId),
            this.customerRepo.findByCompanyId(query.companyId),
        ]);
        const customerMap = new Map(customers.map((c) => [c.id, c]));
        if (query.allowedGarageIds !== undefined && query.allowedGarageIds !== null) {
            const allowedSet = new Set(query.allowedGarageIds);
            const allowedCustomerIds = new Set(customers.filter((c) => c.garageId && allowedSet.has(c.garageId)).map((c) => c.id));
            bills = bills.filter((b) => allowedCustomerIds.has(b.customerId));
        }
        if (query.garageId && query.garageId.trim()) {
            const targetGarageId = query.garageId.trim();
            const targetCustomerIds = new Set(customers.filter((c) => c.garageId === targetGarageId).map((c) => c.id));
            bills = bills.filter((b) => targetCustomerIds.has(b.customerId));
        }
        if (query.fromDate) {
            const fromTime = new Date(query.fromDate).setHours(0, 0, 0, 0);
            bills = bills.filter((b) => new Date(b.date).getTime() >= fromTime);
        }
        if (query.toDate) {
            const toTime = new Date(query.toDate).setHours(23, 59, 59, 999);
            bills = bills.filter((b) => new Date(b.date).getTime() <= toTime);
        }
        if (query.search && query.search.trim()) {
            const q = query.search.trim().toLowerCase();
            bills = bills.filter((b) => {
                const cust = customerMap.get(b.customerId);
                const nameMatch = cust?.name?.toLowerCase().includes(q);
                const codeMatch = cust?.customerCode?.toLowerCase().includes(q);
                const phoneMatch = cust?.mobileNumber?.includes(q);
                const billNumMatch = String(b.billNumber || '').includes(q);
                const cIdMatch = cust?.cId !== undefined && String(cust.cId).includes(q);
                const nidMatch = cust?.nidNumber?.toLowerCase().includes(q);
                const uuidMatch = b.customerId?.toLowerCase().includes(q);
                return nameMatch || codeMatch || phoneMatch || billNumMatch || cIdMatch || nidMatch || uuidMatch;
            });
        }
        bills.sort((a, b) => {
            const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime();
            if (dateDiff !== 0)
                return dateDiff;
            const createdA = a.createdDate ? new Date(a.createdDate).getTime() : 0;
            const createdB = b.createdDate ? new Date(b.createdDate).getTime() : 0;
            return createdB - createdA;
        });
        const seenCustomerIds = new Set();
        return bills.map((b) => {
            const cust = customerMap.get(b.customerId);
            const isLatest = !seenCustomerIds.has(b.customerId);
            seenCustomerIds.add(b.customerId);
            return {
                id: b.id,
                billNumber: b.billNumber,
                customerId: b.customerId,
                customerName: cust?.name || 'Unknown Customer',
                customerCode: cust?.customerCode || null,
                customerCId: cust?.cId,
                garageId: cust?.garageId,
                garageName: cust?.garageName || null,
                companyId: b.companyId,
                date: b.date,
                previousUnit: b.previousUnit,
                currentUnit: b.currentUnit,
                totalUnit: b.totalUnit,
                electricBill: b.electricBill,
                previousDues: b.previousDues,
                rentBill: b.rentBill,
                loan: b.loan,
                totalBill: b.totalBill,
                clearMoney: b.clearMoney,
                presentDues: b.presentDues,
                isLatestBill: isLatest,
            };
        });
    }
};
exports.GetElectricBillsByCompanyHandler = GetElectricBillsByCompanyHandler;
exports.GetElectricBillsByCompanyHandler = GetElectricBillsByCompanyHandler = __decorate([
    (0, cqrs_1.QueryHandler)(get_electric_bills_by_company_query_1.GetElectricBillsByCompanyQuery),
    __param(0, (0, common_1.Inject)(index_1.ELECTRIC_BILL_REPOSITORY_TOKEN)),
    __param(1, (0, common_1.Inject)(index_1.CUSTOMER_REPOSITORY_TOKEN)),
    __metadata("design:paramtypes", [Object, Object])
], GetElectricBillsByCompanyHandler);
//# sourceMappingURL=get-electric-bills-by-company.handler.js.map