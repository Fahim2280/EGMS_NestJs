import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetCustomerBillSummaryQuery } from '../impl/get-customer-bill-summary.query';
import { BillingCalculationService } from '../../services/billing-calculation.service';
import { CustomerBillSummaryDto } from '../../dtos/electric-bill.dto';

@QueryHandler(GetCustomerBillSummaryQuery)
export class GetCustomerBillSummaryHandler
  implements IQueryHandler<GetCustomerBillSummaryQuery>
{
  constructor(private readonly billingService: BillingCalculationService) {}

  async execute(
    query: GetCustomerBillSummaryQuery,
  ): Promise<CustomerBillSummaryDto> {
    return this.billingService.getCustomerBillSummary(
      query.customerId,
      query.companyId,
    );
  }
}
