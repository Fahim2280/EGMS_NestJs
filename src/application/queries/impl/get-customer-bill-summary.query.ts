export class GetCustomerBillSummaryQuery {
  constructor(
    public readonly customerId: string,
    public readonly companyId: string,
  ) {}
}
