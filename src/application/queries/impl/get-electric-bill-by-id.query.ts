export class GetElectricBillByIdQuery {
  constructor(
    public readonly id: string,
    public readonly companyId: string,
  ) {}
}
