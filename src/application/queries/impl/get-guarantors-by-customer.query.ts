export class GetGuarantorsByCustomerQuery {
  constructor(
    public readonly customerId: string,
    public readonly companyId: string,
  ) {}
}
