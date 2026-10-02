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
exports.GenerateMonthlyBillsHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const uuid_1 = require("uuid");
const generate_monthly_bills_command_1 = require("../impl/generate-monthly-bills.command");
const index_1 = require("../../../domain/index");
const billing_calculation_service_1 = require("../../services/billing-calculation.service");
let GenerateMonthlyBillsHandler = class GenerateMonthlyBillsHandler {
    customerRepo;
    billRepo;
    companyRepo;
    billingService;
    garageRepo;
    constructor(customerRepo, billRepo, companyRepo, billingService, garageRepo) {
        this.customerRepo = customerRepo;
        this.billRepo = billRepo;
        this.companyRepo = companyRepo;
        this.billingService = billingService;
        this.garageRepo = garageRepo;
    }
    async execute(command) {
        const { companyId, targetDate, actorStamp, fromDate } = command;
        const [customers, company, garages] = await Promise.all([
            this.customerRepo.findByCompanyId(companyId),
            this.companyRepo.getByIdAsync(companyId),
            this.garageRepo ? this.garageRepo.findByCompanyId(companyId) : Promise.resolve([]),
        ]);
        const inactiveGarageIds = new Set((garages || []).filter((g) => g.isActive === false).map((g) => g.id));
        const defaultUnitRate = company?.unitRate || 15;
        const year = targetDate.getFullYear();
        const month = targetDate.getMonth();
        const billingFromDate = fromDate || new Date(year, month, 1);
        let successCount = 0;
        let failCount = 0;
        for (const customer of customers) {
            if (!customer.isActive) {
                continue;
            }
            if (customer.garageId && inactiveGarageIds.has(customer.garageId)) {
                continue;
            }
            try {
                const customerBills = await this.billRepo.findByCustomerId(customer.id);
                const billExists = customerBills.some((b) => {
                    const d = new Date(b.date);
                    return d.getFullYear() === year && d.getMonth() === month;
                });
                if (!billExists) {
                    const summary = await this.billingService.getCustomerBillSummary(customer.id, companyId);
                    const calc = await this.billingService.calculateBillValues(customer.id, companyId, summary.lastMeterReading, 0, 0, 0, targetDate, undefined, defaultUnitRate);
                    const bill = index_1.ElectricBill.create({
                        id: (0, uuid_1.v4)(),
                        customerId: customer.id,
                        companyId,
                        date: targetDate,
                        fromDate: billingFromDate,
                        previousUnit: calc.previousUnit,
                        currentUnit: summary.lastMeterReading,
                        totalUnit: calc.totalUnit,
                        electricBill: calc.electricBill,
                        unitRate: calc.unitRate,
                        previousDues: calc.previousDues,
                        rentBill: 0,
                        loan: 0,
                        totalBill: calc.totalBill,
                        clearMoney: 0,
                        presentDues: calc.presentDues,
                        createdBy: actorStamp || `${companyId}|SUPER_ADMIN`,
                    });
                    await this.billRepo.save(bill);
                    successCount++;
                }
            }
            catch (err) {
                failCount++;
            }
        }
        return {
            successCount,
            failCount,
            totalCustomers: customers.length,
        };
    }
};
exports.GenerateMonthlyBillsHandler = GenerateMonthlyBillsHandler;
exports.GenerateMonthlyBillsHandler = GenerateMonthlyBillsHandler = __decorate([
    (0, cqrs_1.CommandHandler)(generate_monthly_bills_command_1.GenerateMonthlyBillsCommand),
    __param(0, (0, common_1.Inject)(index_1.CUSTOMER_REPOSITORY_TOKEN)),
    __param(1, (0, common_1.Inject)(index_1.ELECTRIC_BILL_REPOSITORY_TOKEN)),
    __param(2, (0, common_1.Inject)(index_1.COMPANY_REPOSITORY_TOKEN)),
    __param(4, (0, common_1.Inject)(index_1.GARAGE_REPOSITORY_TOKEN)),
    __metadata("design:paramtypes", [Object, Object, Object, billing_calculation_service_1.BillingCalculationService, Object])
], GenerateMonthlyBillsHandler);
//# sourceMappingURL=generate-monthly-bills.handler.js.map