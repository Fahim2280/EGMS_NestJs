import { CreateElectricBillDto } from '../../dtos/electric-bill.dto';

export class CreateElectricBillCommand {
  constructor(
    public readonly companyId: string,
    public readonly dto: CreateElectricBillDto,
    public readonly actorStamp?: string,
  ) {}
}
