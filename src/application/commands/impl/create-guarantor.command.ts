import { CreateGuarantorDto } from '../../dtos/guarantor.dto';

export class CreateGuarantorCommand {
  constructor(
    public readonly companyId: string,
    public readonly customerId: string,
    public readonly dto: CreateGuarantorDto,
    public readonly actorStamp?: string,
  ) {}
}
