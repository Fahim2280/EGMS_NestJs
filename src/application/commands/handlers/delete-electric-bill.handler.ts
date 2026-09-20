import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { DeleteElectricBillCommand } from '../impl/delete-electric-bill.command';
import {
  ELECTRIC_BILL_REPOSITORY_TOKEN,
  IElectricBillRepository,
} from '@domain/index';
import { BillingCalculationService } from '../../services/billing-calculation.service';

@CommandHandler(DeleteElectricBillCommand)
export class DeleteElectricBillHandler implements ICommandHandler<DeleteElectricBillCommand> {
  constructor(
    @Inject(ELECTRIC_BILL_REPOSITORY_TOKEN)
    private readonly billRepo: IElectricBillRepository,
    private readonly billingService: BillingCalculationService,
  ) {}

  async execute(command: DeleteElectricBillCommand): Promise<boolean> {
    const { id, companyId, actorStamp } = command;

    const bill = await this.billRepo.getByIdAsync(id);
    if (!bill || bill.companyId !== companyId) {
      throw new NotFoundException('Electric bill not found.');
    }

    const customerId = bill.customerId;
    const billDate = bill.date;

    bill.softDelete(actorStamp || `${companyId}|SUPER_ADMIN`);
    await this.billRepo.updateAsync(bill);

    // Cascade recalculation to all subsequent bills after this deleted bill
    await this.billingService.cascadeRecalculateSubsequentBills(
      customerId,
      companyId,
      billDate,
      actorStamp || `${companyId}|SUPER_ADMIN`,
    );

    return true;
  }
}
