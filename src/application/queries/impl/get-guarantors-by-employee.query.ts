export class GetGuarantorsByEmployeeQuery {
  constructor(
    public readonly employeeId: string,
    public readonly companyId: string,
  ) {}
}
