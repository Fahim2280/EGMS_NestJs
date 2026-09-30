export class ToggleGarageStatusCommand {
  constructor(
    public readonly id: string,
    public readonly companyId: string,
    public readonly actorStamp?: string,
  ) {}
}
