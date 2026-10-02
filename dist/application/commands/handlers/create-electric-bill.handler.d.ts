import { ICommandHandler } from '@nestjs/cqrs';
import { CreateElectricBillCommand } from '../impl/create-electric-bill.command';
import { ElectricBill, IElectricBillRepository } from "../../../domain/index";
import { BillingCalculationService } from '../../services/billing-calculation.service';
export declare class CreateElectricBillHandler implements ICommandHandler<CreateElectricBillCommand> {
    private readonly billRepo;
    private readonly billingService;
    constructor(billRepo: IElectricBillRepository, billingService: BillingCalculationService);
    execute(command: CreateElectricBillCommand): Promise<ElectricBill>;
}
