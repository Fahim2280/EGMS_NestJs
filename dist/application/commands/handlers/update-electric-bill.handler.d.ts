import { ICommandHandler } from '@nestjs/cqrs';
import { UpdateElectricBillCommand } from '../impl/update-electric-bill.command';
import { ElectricBill, IElectricBillRepository } from "../../../domain/index";
import { BillingCalculationService } from '../../services/billing-calculation.service';
export declare class UpdateElectricBillHandler implements ICommandHandler<UpdateElectricBillCommand> {
    private readonly billRepo;
    private readonly billingService;
    constructor(billRepo: IElectricBillRepository, billingService: BillingCalculationService);
    execute(command: UpdateElectricBillCommand): Promise<ElectricBill>;
}
