import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { CreateElectricBillCommand } from '../impl/create-electric-bill.command';
import {
  ElectricBill,
  ELECTRIC_BILL_REPOSITORY_TOKEN,
  IElectricBillRepository,
} from '@domain/index';
import { BillingCalculationService } from '../../services/billing-calculation.service';

@CommandHandler(CreateElectricBillCommand)
export class CreateElectricBillHandler implements ICommandHandler<CreateElectricBillCommand> {
  constructor(
    @Inject(ELECTRIC_BILL_REPOSITORY_TOKEN)
    private readonly billRepo: IElectricBillRepository,
    private readonly billingService: BillingCalculationService,
  ) {}

  async execute(command: CreateElectricBillCommand): Promise<ElectricBill> {
    const { companyId, dto, actorStamp } = command;
    const billDate = dto.date ? new Date(dto.date) : new Date();

    const actorRole = actorStamp?.split('|')[1] || '';
    const customRate = actorRole === 'SUPER_ADMIN' ? dto.unitRate : undefined;

    const calc = await this.billingService.calculateBillValues(
      dto.customerId,
      companyId,
      dto.currentUnit,
      dto.rentBill,
      dto.loan,
      dto.clearMoney,
      billDate,
      undefined,
      customRate,
    );

    const bill = ElectricBill.create({
      id: uuidv4(),
      customerId: dto.customerId,
      companyId,
      date: billDate,
      previousUnit: calc.previousUnit,
      currentUnit: dto.currentUnit,
      totalUnit: calc.totalUnit,
      electricBill: calc.electricBill,
      unitRate: calc.unitRate,
      previousDues: calc.previousDues,
      rentBill: dto.rentBill,
      loan: dto.loan,
      totalBill: calc.totalBill,
      clearMoney: dto.clearMoney,
      presentDues: calc.presentDues,
      createdBy: actorStamp || `${companyId}|SUPER_ADMIN`,
    });

    await this.billRepo.save(bill);
    return bill;
  }
}
