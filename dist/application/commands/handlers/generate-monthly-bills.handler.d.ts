import { ICommandHandler } from '@nestjs/cqrs';
import { GenerateMonthlyBillsCommand } from '../impl/generate-monthly-bills.command';
import { ICustomerRepository, IElectricBillRepository, ICompanyRepository, IGarageRepository } from "../../../domain/index";
import { BillingCalculationService } from '../../services/billing-calculation.service';
export declare class GenerateMonthlyBillsHandler implements ICommandHandler<GenerateMonthlyBillsCommand> {
    private readonly customerRepo;
    private readonly billRepo;
    private readonly companyRepo;
    private readonly billingService;
    private readonly garageRepo?;
    constructor(customerRepo: ICustomerRepository, billRepo: IElectricBillRepository, companyRepo: ICompanyRepository, billingService: BillingCalculationService, garageRepo?: IGarageRepository | undefined);
    execute(command: GenerateMonthlyBillsCommand): Promise<{
        successCount: number;
        failCount: number;
        totalCustomers: number;
    }>;
}
