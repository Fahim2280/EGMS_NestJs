export class UpdateCompanyCommand {
  constructor(
    public readonly companyId: string,
    public readonly name: string,
    public readonly companyName: string,
    public readonly phoneNumber: string,
    public readonly address: string,
    public readonly updatedByStamp: string,
    public readonly unitRate?: number,
  ) {}
}
