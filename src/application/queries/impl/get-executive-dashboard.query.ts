export class GetExecutiveDashboardQuery {
  constructor(
    public readonly companyId: string,
    public readonly allowedGarageIds?: string[] | null,
  ) {}
}
