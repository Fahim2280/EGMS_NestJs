export declare class GetGarageDashboardQuery {
    readonly garageId: string;
    readonly companyId: string;
    readonly fromDate?: Date | undefined;
    readonly toDate?: Date | undefined;
    constructor(garageId: string, companyId: string, fromDate?: Date | undefined, toDate?: Date | undefined);
}
