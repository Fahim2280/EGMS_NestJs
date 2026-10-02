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
exports.BillingCalculationService = exports.RATE_PER_UNIT = void 0;
const common_1 = require("@nestjs/common");
const index_1 = require("../../domain/index");
exports.RATE_PER_UNIT = 15;
let BillingCalculationService = class BillingCalculationService {
    customerRepo;
    billRepo;
    garageRepo;
    constructor(customerRepo, billRepo, garageRepo) {
        this.customerRepo = customerRepo;
        this.billRepo = billRepo;
        this.garageRepo = garageRepo;
    }
    async getCustomerBillSummary(customerId, companyId) {
        const customer = await this.customerRepo.getByIdAsync(customerId);
        if (!customer || customer.companyId !== companyId) {
            throw new common_1.NotFoundException('Customer not found.');
        }
        let isGarageSuspended = false;
        if (customer.garageId && this.garageRepo) {
            const garage = await this.garageRepo.getByIdAsync(customer.garageId);
            isGarageSuspended = garage ? garage.isActive === false : false;
        }
        const lastBill = await this.billRepo.findLatestByCustomerId(customerId);
        if (!lastBill) {
            return {
                customerId: customer.id,
                customerName: customer.name,
                lastMeterReading: customer.previousUnit,
                previousDues: customer.advanceMoney,
                lastBillDate: null,
                isActive: customer.isActive,
                isGarageSuspended,
            };
        }
        return {
            customerId: customer.id,
            customerName: customer.name,
            lastMeterReading: lastBill.currentUnit,
            previousDues: lastBill.presentDues,
            lastBillDate: lastBill.date,
            isActive: customer.isActive,
            isGarageSuspended,
        };
    }
    async previewBill(customerId, companyId, currentMeterReading, rentBill, loan, unitRate = exports.RATE_PER_UNIT) {
        const summary = await this.getCustomerBillSummary(customerId, companyId);
        if (summary.isActive === false) {
            throw new common_1.BadRequestException('msg.customerSuspendedBillingBlocked');
        }
        const totalUnit = currentMeterReading - summary.lastMeterReading;
        const rate = unitRate > 0 ? unitRate : exports.RATE_PER_UNIT;
        const electricBillAmount = Math.max(0, totalUnit) * rate;
        const totalBill = summary.previousDues + electricBillAmount + rentBill + loan;
        return {
            customerId,
            customerName: summary.customerName,
            previousMeterReading: summary.lastMeterReading,
            currentMeterReading,
            consumedUnits: totalUnit,
            electricBill: electricBillAmount,
            unitRate: rate,
            rentBill,
            loan,
            previousDues: summary.previousDues,
            totalBill,
        };
    }
    async calculateBillValues(customerId, companyId, currentUnit, rentBill, loan, clearMoney, billDate, excludeBillId, unitRate = exports.RATE_PER_UNIT) {
        const customer = await this.customerRepo.getByIdAsync(customerId);
        if (!customer || customer.companyId !== companyId) {
            throw new common_1.NotFoundException('Customer not found.');
        }
        if (!customer.isActive && !excludeBillId) {
            throw new common_1.BadRequestException('msg.customerSuspendedBillingBlocked');
        }
        if (customer.garageId && !excludeBillId && this.garageRepo) {
            const garage = await this.garageRepo.getByIdAsync(customer.garageId);
            if (garage && garage.isActive === false) {
                throw new common_1.BadRequestException('msg.garageSuspendedBillingBlocked');
            }
        }
        const previousBill = await this.billRepo.findPreviousBill(customerId, billDate, excludeBillId);
        let previousUnit;
        let previousDues;
        if (!previousBill) {
            previousUnit = customer.previousUnit;
            previousDues = customer.advanceMoney;
        }
        else {
            previousUnit = previousBill.currentUnit;
            previousDues = previousBill.presentDues;
        }
        const totalUnit = currentUnit - previousUnit;
        if (totalUnit < 0) {
            throw new common_1.BadRequestException(`Current unit reading (${currentUnit}) cannot be less than previous unit reading (${previousUnit}).`);
        }
        const rate = unitRate > 0 ? unitRate : exports.RATE_PER_UNIT;
        const electricBillAmount = totalUnit * rate;
        const totalBill = previousDues + electricBillAmount + rentBill + loan;
        const presentDues = totalBill - clearMoney;
        return {
            previousUnit,
            previousDues,
            totalUnit,
            electricBill: electricBillAmount,
            unitRate: rate,
            totalBill,
            presentDues,
        };
    }
    async cascadeRecalculateSubsequentBills(customerId, companyId, fromDate, updatedByStamp) {
        const customer = await this.customerRepo.getByIdAsync(customerId);
        if (!customer || customer.companyId !== companyId)
            return;
        const subsequentBills = await this.billRepo.findSubsequentBills(customerId, fromDate);
        for (const bill of subsequentBills) {
            const prevBill = await this.billRepo.findPreviousBill(customerId, bill.date, bill.id);
            let prevUnit;
            let prevDues;
            if (!prevBill) {
                prevUnit = customer.previousUnit;
                prevDues = customer.advanceMoney;
            }
            else {
                prevUnit = prevBill.currentUnit;
                prevDues = prevBill.presentDues;
            }
            const rate = bill.unitRate || exports.RATE_PER_UNIT;
            bill.recalculate(prevUnit, prevDues, rate, updatedByStamp);
            await this.billRepo.updateAsync(bill);
        }
    }
};
exports.BillingCalculationService = BillingCalculationService;
exports.BillingCalculationService = BillingCalculationService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(index_1.CUSTOMER_REPOSITORY_TOKEN)),
    __param(1, (0, common_1.Inject)(index_1.ELECTRIC_BILL_REPOSITORY_TOKEN)),
    __param(2, (0, common_1.Inject)(index_1.GARAGE_REPOSITORY_TOKEN)),
    __metadata("design:paramtypes", [Object, Object, Object])
], BillingCalculationService);
//# sourceMappingURL=billing-calculation.service.js.map