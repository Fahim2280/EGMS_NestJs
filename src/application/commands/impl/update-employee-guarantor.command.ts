import { UpdateGuarantorDto } from '../../dtos/guarantor.dto';

export class UpdateEmployeeGuarantorCommand {
  constructor(
    public readonly companyId: string,
    public readonly employeeId: string,
    public readonly guarantorId: string,
    public readonly dto: UpdateGuarantorDto,
    public readonly actorStamp?: string,
  ) {}
}
