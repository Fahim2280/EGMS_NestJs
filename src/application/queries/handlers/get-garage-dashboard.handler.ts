import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { GetGarageDashboardQuery } from '../impl/get-garage-dashboard.query';
import {
  GARAGE_REPOSITORY_TOKEN,
  IGarageRepository,
  Garage,
  COMPANY_REPOSITORY_TOKEN,
  ICompanyRepository,
  CUSTOMER_REPOSITORY_TOKEN,
  ICustomerRepository,
  ELECTRIC_BILL_REPOSITORY_TOKEN,
  IElectricBillRepository,
} from '@domain/index';
import {
  GarageDashboardDto,
  GarageMetricsDto,
  GarageResponseDto,
} from '../../dtos/garage.dto';

@QueryHandler(GetGarageDashboardQuery)
export class GetGarageDashboardHandler implements IQueryHandler<GetGarageDashboardQuery, GarageDashboardDto> {
  constructor(
    @Inject(GARAGE_REPOSITORY_TOKEN)
    private readonly garageRepo: IGarageRepository,
    @Inject(COMPANY_REPOSITORY_TOKEN)
    private readonly companyRepo: ICompanyRepository,
    @Inject(CUSTOMER_REPOSITORY_TOKEN)
    private readonly customerRepo: ICustomerRepository,
    @Inject(ELECTRIC_BILL_REPOSITORY_TOKEN)
    private readonly billRepo: IElectricBillRepository,
    @InjectMapper()
    private readonly mapper: Mapper,
  ) {}

  async execute(query: GetGarageDashboardQuery): Promise<GarageDashboardDto> {
    const { garageId, companyId } = query;

    const garage = await this.garageRepo.getByIdAsync(garageId);
    if (!garage || garage.companyId !== companyId) {
      throw new NotFoundException(`Garage with ID '${garageId}' was not found.`);
    }

    const company = await this.companyRepo.findById(companyId);
    const customers = await this.customerRepo.findByGarageId(companyId, garageId);
    const bills = await this.billRepo.findByGarageId(companyId, garageId);

    // Compute Metrics
    const totalCustomers = customers.length;
    let totalUnitsConsumed = 0;
    let totalElectricAmount = 0;
    let totalBilledAmount = 0;
    let totalCollectedRevenue = 0;
    let totalOutstandingDues = 0;

    for (const bill of bills) {
      totalUnitsConsumed += bill.totalUnit || 0;
      totalElectricAmount += bill.electricBill || 0;
      totalBilledAmount += bill.totalBill || 0;
      totalCollectedRevenue += bill.clearMoney || 0;
      totalOutstandingDues += bill.presentDues || 0;
    }

    const averageUnitsPerCustomer =
      totalCustomers > 0 ? Math.round(totalUnitsConsumed / totalCustomers) : 0;

    const metrics: GarageMetricsDto = {
      totalCustomers,
      totalUnitsConsumed,
      totalElectricAmount,
      totalBilledAmount,
      totalCollectedRevenue,
      totalOutstandingDues,
      averageUnitsPerCustomer,
    };

    const customerMap = new Map(customers.map((c) => [c.id, c]));

    // Customer items with calculated last bill dues
    const customerItems = customers.map((c) => {
      const cBills = bills.filter((b) => b.customerId === c.id);
      cBills.sort((a, b) => b.date.getTime() - a.date.getTime());
      const latestBill = cBills[0];

      return {
        id: c.id,
        cId: c.cId,
        name: c.name,
        mobileNumber: c.mobileNumber,
        address: c.address,
        previousUnit: c.previousUnit,
        advanceMoney: c.advanceMoney,
        presentDues: latestBill ? latestBill.presentDues : 0,
        lastBillDate: latestBill ? latestBill.date : null,
        hasBills: !!latestBill,
        garageId: c.garageId,
        garageName: garage.garageName,
      };
    });

    // Recent 15 bills
    const recentBills = bills.slice(0, 15).map((b) => ({
      id: b.id,
      billNumber: b.billNumber,
      customerId: b.customerId,
      customerName: customerMap.get(b.customerId)?.name || 'Unknown',
      date: b.date,
      currentUnit: b.currentUnit,
      totalUnit: b.totalUnit,
      electricBill: b.electricBill,
      totalBill: b.totalBill,
      clearMoney: b.clearMoney,
      presentDues: b.presentDues,
    }));

    const garageDto = this.mapper.map(garage, Garage, GarageResponseDto);
    garageDto.companyName = company?.companyName;
    garageDto.customerCount = totalCustomers;

    return {
      garage: garageDto,
      metrics,
      customers: customerItems,
      recentBills,
    };
  }
}
