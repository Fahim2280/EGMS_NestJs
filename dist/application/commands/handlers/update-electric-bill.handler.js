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
exports.UpdateElectricBillHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const update_electric_bill_command_1 = require("../impl/update-electric-bill.command");
const index_1 = require("../../../domain/index");
const billing_calculation_service_1 = require("../../services/billing-calculation.service");
let UpdateElectricBillHandler = class UpdateElectricBillHandler {
    billRepo;
    billingService;
    constructor(billRepo, billingService) {
        this.billRepo = billRepo;
        this.billingService = billingService;
    }
    async execute(command) {
        const { id, companyId, dto, actorStamp } = command;
        const bill = await this.billRepo.getByIdAsync(id);
        if (!bill || bill.companyId !== companyId) {
            throw new common_1.NotFoundException('Electric bill not found.');
        }
        const latestBill = await this.billRepo.findLatestByCustomerId(bill.customerId);
        if (latestBill && latestBill.id !== bill.id) {
            throw new common_1.BadRequestException('শুধুমাত্র গ্রাহকের সর্বশেষ বিল পরিবর্তন করা সম্ভব। পরবর্তী বিল বিদ্যমান থাকায় এটি অপরিবর্তনীয়।');
        }
        const billDate = dto.date ? new Date(dto.date) : bill.date;
        const actorRole = actorStamp?.split('|')[1] || '';
        const effectiveUnitRate = actorRole === 'SUPER_ADMIN' && dto.unitRate !== undefined && dto.unitRate !== null
            ? Number(dto.unitRate)
            : bill.unitRate;
        const calc = await this.billingService.calculateBillValues(dto.customerId, companyId, dto.currentUnit, dto.rentBill, dto.loan, dto.clearMoney, billDate, id, effectiveUnitRate);
        bill.updateValues(dto.currentUnit, dto.rentBill, dto.loan, dto.clearMoney, billDate, effectiveUnitRate, actorStamp || `${companyId}|SUPER_ADMIN`);
        bill.previousUnit = calc.previousUnit;
        bill.totalUnit = calc.totalUnit;
        bill.electricBill = calc.electricBill;
        bill.unitRate = calc.unitRate;
        bill.previousDues = calc.previousDues;
        bill.totalBill = calc.totalBill;
        bill.presentDues = calc.presentDues;
        await this.billRepo.updateAsync(bill);
        await this.billingService.cascadeRecalculateSubsequentBills(dto.customerId, companyId, billDate, actorStamp || `${companyId}|SUPER_ADMIN`);
        return bill;
    }
};
exports.UpdateElectricBillHandler = UpdateElectricBillHandler;
exports.UpdateElectricBillHandler = UpdateElectricBillHandler = __decorate([
    (0, cqrs_1.CommandHandler)(update_electric_bill_command_1.UpdateElectricBillCommand),
    __param(0, (0, common_1.Inject)(index_1.ELECTRIC_BILL_REPOSITORY_TOKEN)),
    __metadata("design:paramtypes", [Object, billing_calculation_service_1.BillingCalculationService])
], UpdateElectricBillHandler);
//# sourceMappingURL=update-electric-bill.handler.js.map