import { RegisterCompanyDto } from '../../dtos/company.dto';

export class RegisterCompanyCommand {
  constructor(public readonly dto: RegisterCompanyDto) {}
}
