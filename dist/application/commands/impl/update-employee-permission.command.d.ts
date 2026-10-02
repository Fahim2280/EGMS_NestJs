export declare class UpdateEmployeePermissionCommand {
    readonly employeeId: string;
    readonly companyId: string;
    readonly role: string;
    readonly isActive: boolean;
    readonly canCreate: boolean;
    readonly canEdit: boolean;
    readonly canDelete: boolean;
    readonly canView: boolean;
    readonly garageIds: string[];
    readonly updatedByStamp: string;
    constructor(employeeId: string, companyId: string, role: string, isActive: boolean, canCreate: boolean, canEdit: boolean, canDelete: boolean, canView: boolean, garageIds: string[], updatedByStamp: string);
}
