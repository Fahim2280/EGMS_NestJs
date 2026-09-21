export class GenerateMonthlyBillsCommand {
  constructor(
    public readonly companyId: string,
    public readonly targetDate: Date,
    public readonly actorStamp?: string,
    public readonly fromDate?: Date,
  ) {}
}
