export declare class GetElectricBillsByCompanyQuery {
    readonly companyId: string;
    readonly allowedGarageIds?: string[] | null | undefined;
    readonly fromDate?: Date | undefined;
    readonly toDate?: Date | undefined;
    readonly garageId?: string | undefined;
    readonly search?: string | undefined;
    constructor(companyId: string, allowedGarageIds?: string[] | null | undefined, fromDate?: Date | undefined, toDate?: Date | undefined, garageId?: string | undefined, search?: string | undefined);
}
