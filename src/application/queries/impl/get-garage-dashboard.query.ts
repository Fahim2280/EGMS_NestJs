export class GetGarageDashboardQuery {
  constructor(
    public readonly garageId: string,
    public readonly companyId: string,
    public readonly fromDate?: Date,
    public readonly toDate?: Date,
  ) {}
}
