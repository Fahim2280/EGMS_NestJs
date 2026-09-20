import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { GenerateMonthlyBillsCommand } from '../impl/generate-monthly-bills.command';
import {
  CUSTOMER_REPOSITORY_TOKEN,
  ICustomerRepository,
  ELECTRIC_BILL_REPOSITORY_TOKEN,
  IElectricBillRepository,
  COMPANY_REPOSITORY_TOKEN,
  ICompanyRepository,
  ElectricBill,
} from '@domain/index';
import { BillingCalculationService } from '../../services/billing-calculation.service';

@CommandHandler(GenerateMonthlyBillsCommand)
export class GenerateMonthlyBillsHandler
  implements ICommandHandler<GenerateMonthlyBillsCommand>
{
  constructor(
    @Inject(CUSTOMER_REPOSITORY_TOKEN)
    private readonly customerRepo: ICustomerRepository,
    @Inject(ELECTRIC_BILL_REPOSITORY_TOKEN)
    private readonly billRepo: IElectricBillRepository,
    @Inject(COMPANY_REPOSITORY_TOKEN)
    private readonly companyRepo: ICompanyRepository,
    private readonly billingService: BillingCalculationService,
  ) {}

  async execute(
    command: GenerateMonthlyBillsCommand,
  ): Promise<{ successCount: number; failCount: number; totalCustomers: number }> {
    const { companyId, targetDate, actorStamp } = command;
    const [customers, company] = await Promise.all([
      this.customerRepo.findByCompanyId(companyId),
      this.companyRepo.getByIdAsync(companyId),
    ]);

    const defaultUnitRate = company?.unitRate || 15;

    const year = targetDate.getFullYear();
    const month = targetDate.getMonth();

    let successCount = 0;
    let failCount = 0;

    for (const customer of customers) {
      try {
        const customerBills = await this.billRepo.findByCustomerId(customer.id);
        const billExists = customerBills.some((b) => {
          const d = new Date(b.date);
          return d.getFullYear() === year && d.getMonth() === month;
        });

        if (!billExists) {
          const summary = await this.billingService.getCustomerBillSummary(
            customer.id,
            companyId,
          );

          const calc = await this.billingService.calculateBillValues(
            customer.id,
            companyId,
            summary.lastMeterReading, // 0 consumed units
            0,
            0,
            0,
            targetDate,
            undefined,
            defaultUnitRate,
          );

          const bill = ElectricBill.create({
            id: uuidv4(),
            customerId: customer.id,
            companyId,
            date: targetDate,
            previousUnit: calc.previousUnit,
            currentUnit: summary.lastMeterReading,
            totalUnit: calc.totalUnit,
            electricBill: calc.electricBill,
            unitRate: calc.unitRate,
            previousDues: calc.previousDues,
            rentBill: 0,
            loan: 0,
            totalBill: calc.totalBill,
            clearMoney: 0,
            presentDues: calc.presentDues,
            createdBy: actorStamp || `${companyId}|SUPER_ADMIN`,
          });

          await this.billRepo.save(bill);
          successCount++;
        }
      } catch (err) {
        failCount++;
      }
    }

    return {
      successCount,
      failCount,
      totalCustomers: customers.length,
    };
  }
}
