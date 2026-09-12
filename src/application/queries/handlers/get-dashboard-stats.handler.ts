import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetDashboardStatsQuery } from '../impl/get-dashboard-stats.query';
import {
  COMPANY_REPOSITORY_TOKEN,
  ICompanyRepository,
  GARAGE_REPOSITORY_TOKEN,
  IGarageRepository,
  EMPLOYEE_REPOSITORY_TOKEN,
  IEmployeeRepository,
} from '@domain/index';

export interface DashboardStatsResult {
  totalCompanies: number;
  totalGarages: number;
  totalEmployees: number;
  companyGaragesCount: number;
  companyEmployeesCount: number;
}

@QueryHandler(GetDashboardStatsQuery)
export class GetDashboardStatsHandler
  implements IQueryHandler<GetDashboardStatsQuery, DashboardStatsResult> {
  constructor(
    @Inject(COMPANY_REPOSITORY_TOKEN)
    private readonly companyRepo: ICompanyRepository,
    @Inject(GARAGE_REPOSITORY_TOKEN)
    private readonly garageRepo: IGarageRepository,
    @Inject(EMPLOYEE_REPOSITORY_TOKEN)
    private readonly employeeRepo: IEmployeeRepository,
  ) {}

  async execute(query: GetDashboardStatsQuery): Promise<DashboardStatsResult> {
    const totalCompanies = await this.companyRepo.count();
    const totalGarages = await this.garageRepo.count();
    const totalEmployees = await this.employeeRepo.count();

    let companyGaragesCount = 0;
    let companyEmployeesCount = 0;

    if (query.companyId) {
      const companyGarages = await this.garageRepo.findByCompanyId(query.companyId);
      companyGaragesCount = companyGarages.length;
      companyEmployeesCount = await this.employeeRepo.countByCompanyId(query.companyId);
    }

    return {
      totalCompanies,
      totalGarages,
      totalEmployees,
      companyGaragesCount,
      companyEmployeesCount,
    };
  }
}
