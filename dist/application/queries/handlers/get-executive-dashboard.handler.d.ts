import { IQueryHandler } from '@nestjs/cqrs';
import { GetExecutiveDashboardQuery } from '../impl/get-executive-dashboard.query';
import { ICustomerRepository, IElectricBillRepository, IGarageRepository } from "../../../domain/index";
import { CustomerDashboardItemDto } from '../../dtos/customer.dto';
export interface ExecutiveDashboardResult {
    totalAdvanceMoney: number;
    totalPresentDues: number;
    balance: number;
    customerCount: number;
    customersWithBills: number;
    customersWithoutBills: number;
    customers: CustomerDashboardItemDto[];
}
export declare class GetExecutiveDashboardHandler implements IQueryHandler<GetExecutiveDashboardQuery> {
    private readonly customerRepo;
    private readonly billRepo;
    private readonly garageRepo?;
    constructor(customerRepo: ICustomerRepository, billRepo: IElectricBillRepository, garageRepo?: IGarageRepository | undefined);
    execute(query: GetExecutiveDashboardQuery): Promise<ExecutiveDashboardResult>;
}
