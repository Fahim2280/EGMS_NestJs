import { IQueryHandler } from '@nestjs/cqrs';
import { PreviewElectricBillQuery } from '../impl/preview-electric-bill.query';
import { BillingCalculationService } from '../../services/billing-calculation.service';
import { ElectricBillPreviewDto } from '../../dtos/electric-bill.dto';
export declare class PreviewElectricBillHandler implements IQueryHandler<PreviewElectricBillQuery> {
    private readonly billingService;
    constructor(billingService: BillingCalculationService);
    execute(query: PreviewElectricBillQuery): Promise<ElectricBillPreviewDto>;
}
