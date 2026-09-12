import { CreateGarageDto } from '../../dtos/garage.dto';

export class CreateGarageCommand {
  constructor(
    public readonly companyId: string,
    public readonly dto: CreateGarageDto,
  ) {}
}
