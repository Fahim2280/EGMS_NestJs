export class GetDashboardStatsQuery {
  constructor(
    public readonly companyId?: string,
    public readonly allowedGarageIds?: string[] | null,
  ) {}
}
