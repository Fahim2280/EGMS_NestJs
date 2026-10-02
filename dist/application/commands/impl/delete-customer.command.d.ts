export declare class DeleteCustomerCommand {
    readonly id: string;
    readonly companyId: string;
    readonly actorStamp?: string | undefined;
    constructor(id: string, companyId: string, actorStamp?: string | undefined);
}
