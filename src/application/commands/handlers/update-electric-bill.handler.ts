import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { UpdateElectricBillCommand } from '../impl/update-electric-bill.command';
import {
  ElectricBill,
  ELECTRIC_BILL_REPOSITORY_TOKEN,
  IElectricBillRepository,
} from '@domain/index';
import { BillingCalculationService } from '../../services/billing-calculation.service';

@CommandHandler(UpdateElectricBillCommand)
export class UpdateElectricBillHandler implements ICommandHandler<UpdateElectricBillCommand> {
  constructor(
    @Inject(ELECTRIC_BILL_REPOSITORY_TOKEN)
    private readonly billRepo: IElectricBillRepository,
    private readonly billingService: BillingCalculationService,
  ) {}

  async execute(command: UpdateElectricBillCommand): Promise<ElectricBill> {
    const { id, companyId, dto, actorStamp } = command;

    const bill = await this.billRepo.getByIdAsync(id);
    if (!bill || bill.companyId !== companyId) {
      throw new NotFoundException('Electric bill not found.');
    }

    const billDate = dto.date ? new Date(dto.date) : bill.date;

    const actorRole = actorStamp?.split('|')[1] || '';
    const effectiveUnitRate =
      actorRole === 'SUPER_ADMIN' && dto.unitRate !== undefined && dto.unitRate !== null
        ? Number(dto.unitRate)
        : bill.unitRate;

    const calc = await this.billingService.calculateBillValues(
      dto.customerId,
      companyId,
      dto.currentUnit,
      dto.rentBill,
      dto.loan,
      dto.clearMoney,
      billDate,
      id,
      effectiveUnitRate,
    );

    bill.updateValues(
      dto.currentUnit,
      dto.rentBill,
      dto.loan,
      dto.clearMoney,
      billDate,
      effectiveUnitRate,
      actorStamp || `${companyId}|SUPER_ADMIN`,
    );

    bill.previousUnit = calc.previousUnit;
    bill.totalUnit = calc.totalUnit;
    bill.electricBill = calc.electricBill;
    bill.unitRate = calc.unitRate;
    bill.previousDues = calc.previousDues;
    bill.totalBill = calc.totalBill;
    bill.presentDues = calc.presentDues;

    await this.billRepo.updateAsync(bill);

    // Cascade recalculation to all subsequent bills
    await this.billingService.cascadeRecalculateSubsequentBills(
      dto.customerId,
      companyId,
      billDate,
      actorStamp || `${companyId}|SUPER_ADMIN`,
    );

    return bill;
  }
}
