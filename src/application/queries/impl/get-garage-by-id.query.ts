export class GetGarageByIdQuery {
  constructor(
    public readonly id: string,
    public readonly companyId: string,
  ) {}
}
