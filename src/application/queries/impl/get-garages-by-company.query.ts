export class GetGaragesByCompanyQuery {
  constructor(
    public readonly companyId: string,
    public readonly allowedGarageIds?: string[] | null,
  ) {}
}
