export declare class CreateElectricBillDto {
    customerId: string;
    date?: string;
    currentUnit: number;
    rentBill: number;
    loan: number;
    clearMoney: number;
    unitRate?: number;
}
export declare class UpdateElectricBillDto {
    id: string;
    customerId: string;
    date?: string;
    currentUnit: number;
    rentBill: number;
    loan: number;
    clearMoney: number;
    unitRate?: number;
}
export declare class ElectricBillResponseDto {
    id: string;
    billNumber?: number;
    customerId: string;
    customerName?: string;
    customerCode?: string | null;
    customerCId?: number;
    garageId?: string | null;
    garageName?: string | null;
    companyId: string;
    date: Date;
    previousUnit: number;
    currentUnit: number;
    totalUnit: number;
    electricBill: number;
    unitRate?: number;
    previousDues: number;
    rentBill: number;
    loan: number;
    totalBill: number;
    clearMoney: number;
    presentDues: number;
    isLatestBill?: boolean;
}
export declare class ElectricBillPreviewDto {
    customerId: string;
    customerName: string;
    previousMeterReading: number;
    currentMeterReading: number;
    consumedUnits: number;
    electricBill: number;
    unitRate?: number;
    rentBill: number;
    loan: number;
    previousDues: number;
    totalBill: number;
}
export declare class CustomerBillSummaryDto {
    customerId: string;
    customerName: string;
    lastMeterReading: number;
    previousDues: number;
    lastBillDate: Date | null;
    isActive?: boolean;
    isGarageSuspended?: boolean;
}
export declare class PreviewBillRequestDto {
    customerId: string;
    currentMeterReading: number;
    rentBill: number;
    loan: number;
    unitRate?: number;
}
