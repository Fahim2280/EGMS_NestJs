export class DeleteEmployeeGuarantorCommand {
  constructor(
    public readonly companyId: string,
    public readonly employeeId: string,
    public readonly guarantorId: string,
    public readonly actorStamp?: string,
  ) {}
}
