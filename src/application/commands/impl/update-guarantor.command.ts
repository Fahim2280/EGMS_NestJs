import { UpdateGuarantorDto } from '../../dtos/guarantor.dto';

export class UpdateGuarantorCommand {
  constructor(
    public readonly companyId: string,
    public readonly customerId: string,
    public readonly guarantorId: string,
    public readonly dto: UpdateGuarantorDto,
    public readonly actorStamp?: string,
  ) {}
}
