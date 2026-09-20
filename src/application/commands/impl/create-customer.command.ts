import { CreateCustomerDto } from '../../dtos/customer.dto';

export class CreateCustomerCommand {
  constructor(
    public readonly companyId: string,
    public readonly dto: CreateCustomerDto,
    public readonly actorStamp?: string,
  ) {}
}
