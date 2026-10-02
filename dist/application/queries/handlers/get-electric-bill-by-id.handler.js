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
exports.GetElectricBillByIdHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const get_electric_bill_by_id_query_1 = require("../impl/get-electric-bill-by-id.query");
const index_1 = require("../../../domain/index");
let GetElectricBillByIdHandler = class GetElectricBillByIdHandler {
    billRepo;
    customerRepo;
    constructor(billRepo, customerRepo) {
        this.billRepo = billRepo;
        this.customerRepo = customerRepo;
    }
    async execute(query) {
        const bill = await this.billRepo.getByIdAsync(query.id);
        if (!bill || bill.companyId !== query.companyId) {
            throw new common_1.NotFoundException('Electric bill not found.');
        }
        const customer = await this.customerRepo.getByIdAsync(bill.customerId);
        return {
            id: bill.id,
            billNumber: bill.billNumber,
            customerId: bill.customerId,
            customerName: customer?.name || 'Unknown Customer',
            customerCode: customer?.customerCode || null,
            customerCId: customer?.cId,
            companyId: bill.companyId,
            date: bill.date,
            previousUnit: bill.previousUnit,
            currentUnit: bill.currentUnit,
            totalUnit: bill.totalUnit,
            electricBill: bill.electricBill,
            previousDues: bill.previousDues,
            rentBill: bill.rentBill,
            loan: bill.loan,
            totalBill: bill.totalBill,
            clearMoney: bill.clearMoney,
            presentDues: bill.presentDues,
        };
    }
};
exports.GetElectricBillByIdHandler = GetElectricBillByIdHandler;
exports.GetElectricBillByIdHandler = GetElectricBillByIdHandler = __decorate([
    (0, cqrs_1.QueryHandler)(get_electric_bill_by_id_query_1.GetElectricBillByIdQuery),
    __param(0, (0, common_1.Inject)(index_1.ELECTRIC_BILL_REPOSITORY_TOKEN)),
    __param(1, (0, common_1.Inject)(index_1.CUSTOMER_REPOSITORY_TOKEN)),
    __metadata("design:paramtypes", [Object, Object])
], GetElectricBillByIdHandler);
//# sourceMappingURL=get-electric-bill-by-id.handler.js.map