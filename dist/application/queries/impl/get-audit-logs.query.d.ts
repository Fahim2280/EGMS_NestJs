export declare class GetAuditLogsQuery {
    readonly companyId: string;
    readonly action?: string | undefined;
    readonly entityType?: string | undefined;
    readonly search?: string | undefined;
    readonly days?: number | undefined;
    readonly page: number;
    readonly limit: number;
    readonly fromDate?: Date | undefined;
    readonly toDate?: Date | undefined;
    constructor(companyId: string, action?: string | undefined, entityType?: string | undefined, search?: string | undefined, days?: number | undefined, page?: number, limit?: number, fromDate?: Date | undefined, toDate?: Date | undefined);
}
