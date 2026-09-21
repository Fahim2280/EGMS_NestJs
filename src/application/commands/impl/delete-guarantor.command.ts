export class DeleteGuarantorCommand {
  constructor(
    public readonly companyId: string,
    public readonly customerId: string,
    public readonly guarantorId: string,
    public readonly actorStamp?: string,
  ) {}
}
