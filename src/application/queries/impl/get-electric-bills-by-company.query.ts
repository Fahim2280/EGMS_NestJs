export class GetElectricBillsByCompanyQuery {
  constructor(
    public readonly companyId: string,
    public readonly allowedGarageIds?: string[] | null,
    public readonly fromDate?: Date,
    public readonly toDate?: Date,
    public readonly garageId?: string,
    public readonly search?: string,
  ) {}
}
