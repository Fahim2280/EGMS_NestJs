export declare class GenerateMonthlyBillsCommand {
    readonly companyId: string;
    readonly targetDate: Date;
    readonly actorStamp?: string | undefined;
    readonly fromDate?: Date | undefined;
    constructor(companyId: string, targetDate: Date, actorStamp?: string | undefined, fromDate?: Date | undefined);
}
