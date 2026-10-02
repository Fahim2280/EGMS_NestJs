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
exports.CreateElectricBillHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const uuid_1 = require("uuid");
const create_electric_bill_command_1 = require("../impl/create-electric-bill.command");
const index_1 = require("../../../domain/index");
const billing_calculation_service_1 = require("../../services/billing-calculation.service");
let CreateElectricBillHandler = class CreateElectricBillHandler {
    billRepo;
    billingService;
    constructor(billRepo, billingService) {
        this.billRepo = billRepo;
        this.billingService = billingService;
    }
    async execute(command) {
        const { companyId, dto, actorStamp } = command;
        const billDate = dto.date ? new Date(dto.date) : new Date();
        const actorRole = actorStamp?.split('|')[1] || '';
        const customRate = actorRole === 'SUPER_ADMIN' ? dto.unitRate : undefined;
        const calc = await this.billingService.calculateBillValues(dto.customerId, companyId, dto.currentUnit, dto.rentBill, dto.loan, dto.clearMoney, billDate, undefined, customRate);
        const bill = index_1.ElectricBill.create({
            id: (0, uuid_1.v4)(),
            customerId: dto.customerId,
            companyId,
            date: billDate,
            previousUnit: calc.previousUnit,
            currentUnit: dto.currentUnit,
            totalUnit: calc.totalUnit,
            electricBill: calc.electricBill,
            unitRate: calc.unitRate,
            previousDues: calc.previousDues,
            rentBill: dto.rentBill,
            loan: dto.loan,
            totalBill: calc.totalBill,
            clearMoney: dto.clearMoney,
            presentDues: calc.presentDues,
            createdBy: actorStamp || `${companyId}|SUPER_ADMIN`,
        });
        await this.billRepo.save(bill);
        return bill;
    }
};
exports.CreateElectricBillHandler = CreateElectricBillHandler;
exports.CreateElectricBillHandler = CreateElectricBillHandler = __decorate([
    (0, cqrs_1.CommandHandler)(create_electric_bill_command_1.CreateElectricBillCommand),
    __param(0, (0, common_1.Inject)(index_1.ELECTRIC_BILL_REPOSITORY_TOKEN)),
    __metadata("design:paramtypes", [Object, billing_calculation_service_1.BillingCalculationService])
], CreateElectricBillHandler);
//# sourceMappingURL=create-electric-bill.handler.js.map