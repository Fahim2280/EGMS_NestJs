import { UpdateGarageDto } from '../../dtos/garage.dto';

export class UpdateGarageCommand {
  constructor(
    public readonly id: string,
    public readonly companyId: string,
    public readonly dto: UpdateGarageDto,
    public readonly actorStamp?: string,
  ) {}
}
