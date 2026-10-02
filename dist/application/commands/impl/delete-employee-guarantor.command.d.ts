export declare class DeleteEmployeeGuarantorCommand {
    readonly companyId: string;
    readonly employeeId: string;
    readonly guarantorId: string;
    readonly actorStamp?: string | undefined;
    constructor(companyId: string, employeeId: string, guarantorId: string, actorStamp?: string | undefined);
}
