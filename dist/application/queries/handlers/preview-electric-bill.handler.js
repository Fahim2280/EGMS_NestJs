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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PreviewElectricBillHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const preview_electric_bill_query_1 = require("../impl/preview-electric-bill.query");
const billing_calculation_service_1 = require("../../services/billing-calculation.service");
let PreviewElectricBillHandler = class PreviewElectricBillHandler {
    billingService;
    constructor(billingService) {
        this.billingService = billingService;
    }
    async execute(query) {
        return this.billingService.previewBill(query.customerId, query.companyId, query.currentMeterReading, query.rentBill, query.loan, query.unitRate);
    }
};
exports.PreviewElectricBillHandler = PreviewElectricBillHandler;
exports.PreviewElectricBillHandler = PreviewElectricBillHandler = __decorate([
    (0, cqrs_1.QueryHandler)(preview_electric_bill_query_1.PreviewElectricBillQuery),
    __metadata("design:paramtypes", [billing_calculation_service_1.BillingCalculationService])
], PreviewElectricBillHandler);
//# sourceMappingURL=preview-electric-bill.handler.js.map