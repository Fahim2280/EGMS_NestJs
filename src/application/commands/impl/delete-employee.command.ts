export class DeleteEmployeeCommand {
  constructor(
    public readonly id: string,
    public readonly companyId: string,
    public readonly deletedByStamp: string,
  ) {}
}
