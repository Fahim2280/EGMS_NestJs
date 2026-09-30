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
    const allBills = await this.billRepo.findByGarageId(companyId, garageId);

    // Apply date range filter on bills if specified
    let filteredBills = allBills;
    if (query.fromDate) {
      const fromTime = new Date(query.fromDate).setHours(0, 0, 0, 0);
      filteredBills = filteredBills.filter(
        (b) => new Date(b.date).getTime() >= fromTime,
      );
    }
    if (query.toDate) {
      const toTime = new Date(query.toDate).setHours(23, 59, 59, 999);
      filteredBills = filteredBills.filter(
        (b) => new Date(b.date).getTime() <= toTime,
      );
    }

    // Sort filtered bills descending by date
    filteredBills.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Compute Metrics based on filtered bills
    const totalCustomers = customers.length;
    let totalUnitsConsumed = 0;
    let totalElectricAmount = 0;
    let totalBilledAmount = 0;
    let totalCollectedRevenue = 0;
    let totalOutstandingDues = 0;

    for (const bill of filteredBills) {
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

    // Pre-calculate latest bill ID per customer across all lifetime garage bills
    const latestBillIdByCustomer = new Map<string, string>();
    for (const c of customers) {
      const cBills = allBills.filter((b) => b.customerId === c.id);
      if (cBills.length > 0) {
        cBills.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        latestBillIdByCustomer.set(c.id, cBills[0].id);
      }
    }

    // Customer items with calculated last bill dues (evaluated against allBills to preserve lifetime dues)
    const customerItems = customers.map((c) => {
      const latestBillId = latestBillIdByCustomer.get(c.id);
      const latestBill = latestBillId ? allBills.find((b) => b.id === latestBillId) : null;

      return {
        id: c.id,
        cId: c.cId,
        customerCode: c.customerCode,
        name: c.name,
        isActive: c.isActive,
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

    // Recent 20 filtered bills
    const recentBills = filteredBills.slice(0, 20).map((b) => ({
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
      isLatestBill: latestBillIdByCustomer.get(b.customerId) === b.id,
    }));

    const garageDto = this.mapper.map(garage, Garage, GarageResponseDto);
    garageDto.companyName = company?.companyName;
    garageDto.customerCount = totalCustomers;

    return {
      garage: garageDto,
      metrics,
      customers: customerItems,
      recentBills,
      totalFilteredBillsCount: filteredBills.length,
      fromDate: query.fromDate ? new Date(query.fromDate).toISOString().split('T')[0] : undefined,
      toDate: query.toDate ? new Date(query.toDate).toISOString().split('T')[0] : undefined,
    };
  }
}
