export class GetEmployeeByIdQuery {
  constructor(
    public readonly id: string,
    public readonly companyId: string,
  ) {}
}
