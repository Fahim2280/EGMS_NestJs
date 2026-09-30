import { Inject, Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import {
  CUSTOMER_REPOSITORY_TOKEN,
  ICustomerRepository,
  ELECTRIC_BILL_REPOSITORY_TOKEN,
  IElectricBillRepository,
  GARAGE_REPOSITORY_TOKEN,
  IGarageRepository,
  ElectricBill,
} from '@domain/index';
import {
  CustomerBillSummaryDto,
  ElectricBillPreviewDto,
} from '../dtos/electric-bill.dto';

export const RATE_PER_UNIT = 15;

@Injectable()
export class BillingCalculationService {
  constructor(
    @Inject(CUSTOMER_REPOSITORY_TOKEN)
    private readonly customerRepo: ICustomerRepository,
    @Inject(ELECTRIC_BILL_REPOSITORY_TOKEN)
    private readonly billRepo: IElectricBillRepository,
    @Inject(GARAGE_REPOSITORY_TOKEN)
    private readonly garageRepo?: IGarageRepository,
  ) {}

  async getCustomerBillSummary(
    customerId: string,
    companyId: string,
  ): Promise<CustomerBillSummaryDto> {
    const customer = await this.customerRepo.getByIdAsync(customerId);
    if (!customer || customer.companyId !== companyId) {
      throw new NotFoundException('Customer not found.');
    }

    let isGarageSuspended = false;
    if (customer.garageId && this.garageRepo) {
      const garage = await this.garageRepo.getByIdAsync(customer.garageId);
      isGarageSuspended = garage ? garage.isActive === false : false;
    }

    const lastBill = await this.billRepo.findLatestByCustomerId(customerId);
    if (!lastBill) {
      return {
        customerId: customer.id,
        customerName: customer.name,
        lastMeterReading: customer.previousUnit,
        previousDues: customer.advanceMoney,
        lastBillDate: null,
        isActive: customer.isActive,
        isGarageSuspended,
      };
    }

    return {
      customerId: customer.id,
      customerName: customer.name,
      lastMeterReading: lastBill.currentUnit,
      previousDues: lastBill.presentDues,
      lastBillDate: lastBill.date,
      isActive: customer.isActive,
      isGarageSuspended,
    };
  }

  async previewBill(
    customerId: string,
    companyId: string,
    currentMeterReading: number,
    rentBill: number,
    loan: number,
    unitRate: number = RATE_PER_UNIT,
  ): Promise<ElectricBillPreviewDto> {
    const summary = await this.getCustomerBillSummary(customerId, companyId);
    if (summary.isActive === false) {
      throw new BadRequestException('msg.customerSuspendedBillingBlocked');
    }
    const totalUnit = currentMeterReading - summary.lastMeterReading;
    const rate = unitRate > 0 ? unitRate : RATE_PER_UNIT;
    const electricBillAmount = Math.max(0, totalUnit) * rate;
    const totalBill = summary.previousDues + electricBillAmount + rentBill + loan;

    return {
      customerId,
      customerName: summary.customerName,
      previousMeterReading: summary.lastMeterReading,
      currentMeterReading,
      consumedUnits: totalUnit,
      electricBill: electricBillAmount,
      unitRate: rate,
      rentBill,
      loan,
      previousDues: summary.previousDues,
      totalBill,
    };
  }

  async calculateBillValues(
    customerId: string,
    companyId: string,
    currentUnit: number,
    rentBill: number,
    loan: number,
    clearMoney: number,
    billDate: Date,
    excludeBillId?: string,
    unitRate: number = RATE_PER_UNIT,
  ) {
    const customer = await this.customerRepo.getByIdAsync(customerId);
    if (!customer || customer.companyId !== companyId) {
      throw new NotFoundException('Customer not found.');
    }

    if (!customer.isActive && !excludeBillId) {
      throw new BadRequestException('msg.customerSuspendedBillingBlocked');
    }

    if (customer.garageId && !excludeBillId && this.garageRepo) {
      const garage = await this.garageRepo.getByIdAsync(customer.garageId);
      if (garage && garage.isActive === false) {
        throw new BadRequestException('msg.garageSuspendedBillingBlocked');
      }
    }

    const previousBill = await this.billRepo.findPreviousBill(
      customerId,
      billDate,
      excludeBillId,
    );

    let previousUnit: number;
    let previousDues: number;

    if (!previousBill) {
      previousUnit = customer.previousUnit;
      previousDues = customer.advanceMoney;
    } else {
      previousUnit = previousBill.currentUnit;
      previousDues = previousBill.presentDues;
    }

    const totalUnit = currentUnit - previousUnit;
    if (totalUnit < 0) {
      throw new BadRequestException(
        `Current unit reading (${currentUnit}) cannot be less than previous unit reading (${previousUnit}).`,
      );
    }

    const rate = unitRate > 0 ? unitRate : RATE_PER_UNIT;
    const electricBillAmount = totalUnit * rate;
    const totalBill = previousDues + electricBillAmount + rentBill + loan;
    const presentDues = totalBill - clearMoney;

    return {
      previousUnit,
      previousDues,
      totalUnit,
      electricBill: electricBillAmount,
      unitRate: rate,
      totalBill,
      presentDues,
    };
  }

  async cascadeRecalculateSubsequentBills(
    customerId: string,
    companyId: string,
    fromDate: Date,
    updatedByStamp: string,
  ): Promise<void> {
    const customer = await this.customerRepo.getByIdAsync(customerId);
    if (!customer || customer.companyId !== companyId) return;

    const subsequentBills = await this.billRepo.findSubsequentBills(
      customerId,
      fromDate,
    );

    for (const bill of subsequentBills) {
      const prevBill = await this.billRepo.findPreviousBill(
        customerId,
        bill.date,
        bill.id,
      );

      let prevUnit: number;
      let prevDues: number;

      if (!prevBill) {
        prevUnit = customer.previousUnit;
        prevDues = customer.advanceMoney;
      } else {
        prevUnit = prevBill.currentUnit;
        prevDues = prevBill.presentDues;
      }

      const rate = bill.unitRate || RATE_PER_UNIT;
      bill.recalculate(prevUnit, prevDues, rate, updatedByStamp);
      await this.billRepo.updateAsync(bill);
    }
  }
}
