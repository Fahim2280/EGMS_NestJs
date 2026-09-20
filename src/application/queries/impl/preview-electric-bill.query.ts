export class PreviewElectricBillQuery {
  constructor(
    public readonly customerId: string,
    public readonly companyId: string,
    public readonly currentMeterReading: number,
    public readonly rentBill: number,
    public readonly loan: number,
    public readonly unitRate?: number,
  ) {}
}
