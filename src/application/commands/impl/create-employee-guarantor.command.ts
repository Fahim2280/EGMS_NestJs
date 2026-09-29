import { CreateGuarantorDto } from '../../dtos/guarantor.dto';

export class CreateEmployeeGuarantorCommand {
  constructor(
    public readonly companyId: string,
    public readonly employeeId: string,
    public readonly dto: CreateGuarantorDto,
    public readonly actorStamp?: string,
  ) {}
}
