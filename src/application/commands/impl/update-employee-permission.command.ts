export class UpdateEmployeePermissionCommand {
  constructor(
    public readonly employeeId: string,
    public readonly companyId: string,
    public readonly role: string,
    public readonly isActive: boolean,
    public readonly updatedByStamp: string,
  ) {}
}
