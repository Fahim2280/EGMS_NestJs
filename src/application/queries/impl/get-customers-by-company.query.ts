export class GetCustomersByCompanyQuery {
  constructor(
    public readonly companyId: string,
    public readonly allowedGarageIds?: string[] | null,
  ) {}
}
