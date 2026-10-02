import { ICommandHandler } from '@nestjs/cqrs';
import { DeleteElectricBillCommand } from '../impl/delete-electric-bill.command';
import { IElectricBillRepository } from "../../../domain/index";
import { BillingCalculationService } from '../../services/billing-calculation.service';
export declare class DeleteElectricBillHandler implements ICommandHandler<DeleteElectricBillCommand> {
    private readonly billRepo;
    private readonly billingService;
    constructor(billRepo: IElectricBillRepository, billingService: BillingCalculationService);
    execute(command: DeleteElectricBillCommand): Promise<boolean>;
}
