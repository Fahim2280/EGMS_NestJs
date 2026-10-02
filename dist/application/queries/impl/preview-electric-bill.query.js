"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PreviewElectricBillQuery = void 0;
class PreviewElectricBillQuery {
    customerId;
    companyId;
    currentMeterReading;
    rentBill;
    loan;
    unitRate;
    constructor(customerId, companyId, currentMeterReading, rentBill, loan, unitRate) {
        this.customerId = customerId;
        this.companyId = companyId;
        this.currentMeterReading = currentMeterReading;
        this.rentBill = rentBill;
        this.loan = loan;
        this.unitRate = unitRate;
    }
}
exports.PreviewElectricBillQuery = PreviewElectricBillQuery;
//# sourceMappingURL=preview-electric-bill.query.js.map