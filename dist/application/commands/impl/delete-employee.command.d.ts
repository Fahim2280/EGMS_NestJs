export declare class DeleteEmployeeCommand {
    readonly id: string;
    readonly companyId: string;
    readonly deletedByStamp: string;
    constructor(id: string, companyId: string, deletedByStamp: string);
}
