export declare class UpdateCompanyCommand {
    readonly companyId: string;
    readonly name: string;
    readonly companyName: string;
    readonly phoneNumber: string;
    readonly address: string;
    readonly updatedByStamp: string;
    readonly unitRate?: number | undefined;
    constructor(companyId: string, name: string, companyName: string, phoneNumber: string, address: string, updatedByStamp: string, unitRate?: number | undefined);
}
