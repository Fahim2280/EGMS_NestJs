import { ICustomerRepository, IElectricBillRepository, IGarageRepository } from "../../domain/index";
import { CustomerBillSummaryDto, ElectricBillPreviewDto } from '../dtos/electric-bill.dto';
export declare const RATE_PER_UNIT = 15;
export declare class BillingCalculationService {
    private readonly customerRepo;
    private readonly billRepo;
    private readonly garageRepo?;
    constructor(customerRepo: ICustomerRepository, billRepo: IElectricBillRepository, garageRepo?: IGarageRepository | undefined);
    getCustomerBillSummary(customerId: string, companyId: string): Promise<CustomerBillSummaryDto>;
    previewBill(customerId: string, companyId: string, currentMeterReading: number, rentBill: number, loan: number, unitRate?: number): Promise<ElectricBillPreviewDto>;
    calculateBillValues(customerId: string, companyId: string, currentUnit: number, rentBill: number, loan: number, clearMoney: number, billDate: Date, excludeBillId?: string, unitRate?: number): Promise<{
        previousUnit: number;
        previousDues: number;
        totalUnit: number;
        electricBill: number;
        unitRate: number;
        totalBill: number;
        presentDues: number;
    }>;
    cascadeRecalculateSubsequentBills(customerId: string, companyId: string, fromDate: Date, updatedByStamp: string): Promise<void>;
}
