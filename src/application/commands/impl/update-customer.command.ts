import { UpdateCustomerDto } from '../../dtos/customer.dto';

export class UpdateCustomerCommand {
  constructor(
    public readonly id: string,
    public readonly companyId: string,
    public readonly dto: UpdateCustomerDto,
    public readonly actorStamp?: string,
  ) {}
}
