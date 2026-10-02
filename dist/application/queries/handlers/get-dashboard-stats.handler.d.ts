import { IQueryHandler } from '@nestjs/cqrs';
import { GetDashboardStatsQuery } from '../impl/get-dashboard-stats.query';
import { ICompanyRepository, IGarageRepository, IEmployeeRepository } from "../../../domain/index";
export interface DashboardStatsResult {
    totalCompanies: number;
    totalGarages: number;
    totalEmployees: number;
    companyGaragesCount: number;
    companyEmployeesCount: number;
}
export declare class GetDashboardStatsHandler implements IQueryHandler<GetDashboardStatsQuery, DashboardStatsResult> {
    private readonly companyRepo;
    private readonly garageRepo;
    private readonly employeeRepo;
    constructor(companyRepo: ICompanyRepository, garageRepo: IGarageRepository, employeeRepo: IEmployeeRepository);
    execute(query: GetDashboardStatsQuery): Promise<DashboardStatsResult>;
}
