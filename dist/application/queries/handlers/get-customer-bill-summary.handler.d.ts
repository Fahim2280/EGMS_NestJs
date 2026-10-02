import { IQueryHandler } from '@nestjs/cqrs';
import { GetCustomerBillSummaryQuery } from '../impl/get-customer-bill-summary.query';
import { BillingCalculationService } from '../../services/billing-calculation.service';
import { CustomerBillSummaryDto } from '../../dtos/electric-bill.dto';
export declare class GetCustomerBillSummaryHandler implements IQueryHandler<GetCustomerBillSummaryQuery> {
    private readonly billingService;
    constructor(billingService: BillingCalculationService);
    execute(query: GetCustomerBillSummaryQuery): Promise<CustomerBillSummaryDto>;
}
