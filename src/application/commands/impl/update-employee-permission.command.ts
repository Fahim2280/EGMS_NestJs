export class UpdateEmployeePermissionCommand {
  constructor(
    public readonly employeeId: string,
    public readonly companyId: string,
    public readonly role: string,
    public readonly isActive: boolean,
    public readonly canCreate: boolean,
    public readonly canEdit: boolean,
    public readonly canDelete: boolean,
    public readonly canView: boolean,
    public readonly garageIds: string[],
    public readonly updatedByStamp: string,
  ) {}
}
