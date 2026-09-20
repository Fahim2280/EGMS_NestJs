import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PreviewElectricBillQuery } from '../impl/preview-electric-bill.query';
import { BillingCalculationService } from '../../services/billing-calculation.service';
import { ElectricBillPreviewDto } from '../../dtos/electric-bill.dto';

@QueryHandler(PreviewElectricBillQuery)
export class PreviewElectricBillHandler
  implements IQueryHandler<PreviewElectricBillQuery>
{
  constructor(private readonly billingService: BillingCalculationService) {}

  async execute(
    query: PreviewElectricBillQuery,
  ): Promise<ElectricBillPreviewDto> {
    return this.billingService.previewBill(
      query.customerId,
      query.companyId,
      query.currentMeterReading,
      query.rentBill,
      query.loan,
      query.unitRate,
    );
  }
}
