export class UpdateEmployeeCommand {
  constructor(
    public readonly id: string,
    public readonly companyId: string,
    public readonly name: string,
    public readonly address: string,
    public readonly phoneNumber: string,
    public readonly nidNumber: string,
    public readonly updatedByStamp: string,
  ) {}
}
