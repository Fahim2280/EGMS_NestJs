export class GetGarageDashboardQuery {
  constructor(
    public readonly garageId: string,
    public readonly companyId: string,
  ) {}
}
