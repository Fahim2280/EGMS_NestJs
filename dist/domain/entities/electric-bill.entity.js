"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ElectricBill = void 0;
const auditable_entity_1 = require("../common/auditable.entity");
class ElectricBill extends auditable_entity_1.AuditableEntity {
    id;
    billNumber;
    customerId;
    companyId;
    date;
    fromDate;
    previousUnit;
    currentUnit;
    totalUnit;
    electricBill;
    previousDues;
    rentBill;
    loan;
    totalBill;
    clearMoney;
    presentDues;
    unitRate;
    constructor(props) {
        super(props);
        this.validate(props);
        this.id = props.id;
        this.billNumber = props.billNumber;
        this.customerId = props.customerId;
        this.companyId = props.companyId;
        this.date = props.date ? new Date(props.date) : new Date();
        this.fromDate = props.fromDate ? new Date(props.fromDate) : undefined;
        this.previousUnit = Number(props.previousUnit) || 0;
        this.currentUnit = Number(props.currentUnit) || 0;
        this.totalUnit = Number(props.totalUnit) || 0;
        this.electricBill = Number(props.electricBill) || 0;
        this.previousDues = Number(props.previousDues) || 0;
        this.rentBill = Number(props.rentBill) || 0;
        this.loan = Number(props.loan) || 0;
        this.totalBill = Number(props.totalBill) || 0;
        this.clearMoney = Number(props.clearMoney) || 0;
        this.presentDues = Number(props.presentDues) || 0;
        this.unitRate = props.unitRate !== undefined && props.unitRate !== null ? Number(props.unitRate) : 15;
    }
    static create(props) {
        return new ElectricBill({
            ...props,
            isActive: true,
            isDeleted: false,
            createdDate: props.createdDate || new Date(),
        });
    }
    recalculate(previousUnit, previousDues, ratePerUnit, updatedByStamp) {
        const effectiveRate = ratePerUnit !== undefined && ratePerUnit !== null
            ? Number(ratePerUnit)
            : (this.unitRate || 15);
        this.unitRate = effectiveRate;
        this.previousUnit = Number(previousUnit) || 0;
        this.totalUnit = Math.max(0, this.currentUnit - this.previousUnit);
        this.electricBill = this.totalUnit * effectiveRate;
        this.previousDues = Number(previousDues) || 0;
        this.totalBill = this.previousDues + this.electricBill + this.rentBill + this.loan;
        this.presentDues = this.totalBill - this.clearMoney;
        if (updatedByStamp) {
            this.markModified(updatedByStamp);
        }
        else {
            this.modifiedDate = new Date();
        }
    }
    updateValues(currentUnit, rentBill, loan, clearMoney, date, unitRate, updatedByStamp) {
        this.currentUnit = Number(currentUnit) || 0;
        this.rentBill = Number(rentBill) || 0;
        this.loan = Number(loan) || 0;
        this.clearMoney = Number(clearMoney) || 0;
        if (unitRate !== undefined && unitRate !== null) {
            this.unitRate = Number(unitRate);
        }
        if (date)
            this.date = new Date(date);
        if (updatedByStamp) {
            this.markModified(updatedByStamp);
        }
        else {
            this.modifiedDate = new Date();
        }
    }
    validate(props) {
        if (!props.id)
            throw new Error('Electric bill ID is required.');
        if (!props.customerId)
            throw new Error('Customer ID is required.');
        if (!props.companyId)
            throw new Error('Company ID is required.');
    }
}
exports.ElectricBill = ElectricBill;
//# sourceMappingURL=electric-bill.entity.js.map