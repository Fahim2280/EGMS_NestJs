export class GetCustomerByIdQuery {
  constructor(
    public readonly id: string,
    public readonly companyId: string,
  ) {}
}
