import { CreateEmployeeDto } from '../../dtos/employee.dto';

export class CreateEmployeeCommand {
  constructor(
    public readonly companyId: string,
    public readonly dto: CreateEmployeeDto,
  ) {}
}
