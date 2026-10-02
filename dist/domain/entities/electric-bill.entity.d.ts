import { AuditableEntity, AuditableProps } from '../common/auditable.entity';
export interface CreateElectricBillProps extends AuditableProps {
    id: string;
    billNumber?: number;
    customerId: string;
    companyId: string;
    date: Date;
    fromDate?: Date;
    previousUnit: number;
    currentUnit: number;
    totalUnit: number;
    electricBill: number;
    previousDues: number;
    rentBill: number;
    loan: number;
    totalBill: number;
    clearMoney: number;
    presentDues: number;
    unitRate?: number;
}
export declare class ElectricBill extends AuditableEntity {
    readonly id: string;
    billNumber?: number;
    customerId: string;
    companyId: string;
    date: Date;
    fromDate?: Date;
    previousUnit: number;
    currentUnit: number;
    totalUnit: number;
    electricBill: number;
    previousDues: number;
    rentBill: number;
    loan: number;
    totalBill: number;
    clearMoney: number;
    presentDues: number;
    unitRate: number;
    constructor(props: CreateElectricBillProps);
    static create(props: CreateElectricBillProps): ElectricBill;
    recalculate(previousUnit: number, previousDues: number, ratePerUnit?: number, updatedByStamp?: string): void;
    updateValues(currentUnit: number, rentBill: number, loan: number, clearMoney: number, date?: Date, unitRate?: number, updatedByStamp?: string): void;
    private validate;
}
