export declare class PreviewElectricBillQuery {
    readonly customerId: string;
    readonly companyId: string;
    readonly currentMeterReading: number;
    readonly rentBill: number;
    readonly loan: number;
    readonly unitRate?: number | undefined;
    constructor(customerId: string, companyId: string, currentMeterReading: number, rentBill: number, loan: number, unitRate?: number | undefined);
}
