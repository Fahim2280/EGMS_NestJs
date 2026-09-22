export class GetAuditLogsQuery {
  constructor(
    public readonly companyId: string,
    public readonly action?: string,
    public readonly entityType?: string,
    public readonly search?: string,
    public readonly days?: number,
    public readonly page: number = 1,
    public readonly limit: number = 20,
  ) {}
}
