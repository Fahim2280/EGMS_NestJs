export class GetElectricBillsByCompanyQuery {
  constructor(
    public readonly companyId: string,
    public readonly allowedGarageIds?: string[] | null,
  ) {}
}
