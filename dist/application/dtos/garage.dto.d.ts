export declare class CreateGarageDto {
    garageName: string;
    address: string;
    companyId?: string;
}
export declare class UpdateGarageDto {
    garageName?: string;
    address?: string;
}
export declare class GarageResponseDto {
    id: string;
    garageName: string;
    address: string;
    companyId: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    createdDate?: Date;
    modifiedDate?: Date;
    createdBy?: string;
    editByName?: string;
    companyName?: string;
    customerCount?: number;
}
export declare class GarageMetricsDto {
    totalCustomers: number;
    totalUnitsConsumed: number;
    totalElectricAmount: number;
    totalBilledAmount: number;
    totalCollectedRevenue: number;
    totalOutstandingDues: number;
    averageUnitsPerCustomer: number;
}
export declare class GarageDashboardDto {
    garage: GarageResponseDto;
    metrics: GarageMetricsDto;
    customers: any[];
    recentBills: any[];
    totalFilteredBillsCount?: number;
    fromDate?: string;
    toDate?: string;
}
