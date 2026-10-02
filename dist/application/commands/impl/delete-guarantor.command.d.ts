export declare class DeleteGuarantorCommand {
    readonly companyId: string;
    readonly customerId: string;
    readonly guarantorId: string;
    readonly actorStamp?: string | undefined;
    constructor(companyId: string, customerId: string, guarantorId: string, actorStamp?: string | undefined);
}
