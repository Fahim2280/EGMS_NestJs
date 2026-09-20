import { UpdateElectricBillDto } from '../../dtos/electric-bill.dto';

export class UpdateElectricBillCommand {
  constructor(
    public readonly id: string,
    public readonly companyId: string,
    public readonly dto: UpdateElectricBillDto,
    public readonly actorStamp?: string,
  ) {}
}
