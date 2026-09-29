import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetExecutiveDashboardQuery } from '../impl/get-executive-dashboard.query';
import {
  CUSTOMER_REPOSITORY_TOKEN,
  ICustomerRepository,
  ELECTRIC_BILL_REPOSITORY_TOKEN,
  IElectricBillRepository,
} from '@domain/index';
import { CustomerDashboardItemDto } from '../../dtos/customer.dto';

export interface ExecutiveDashboardResult {
  totalAdvanceMoney: number;
  totalPresentDues: number;
  balance: number;
  customerCount: number;
  customersWithBills: number;
  customersWithoutBills: number;
  customers: CustomerDashboardItemDto[];
}

@QueryHandler(GetExecutiveDashboardQuery)
export class GetExecutiveDashboardHandler
  implements IQueryHandler<GetExecutiveDashboardQuery>
{
  constructor(
    @Inject(CUSTOMER_REPOSITORY_TOKEN)
    private readonly customerRepo: ICustomerRepository,
    @Inject(ELECTRIC_BILL_REPOSITORY_TOKEN)
    private readonly billRepo: IElectricBillRepository,
  ) {}

  async execute(
    query: GetExecutiveDashboardQuery,
  ): Promise<ExecutiveDashboardResult> {
    let customers = await this.customerRepo.findByCompanyId(query.companyId);

    if (query.allowedGarageIds !== undefined && query.allowedGarageIds !== null) {
      const allowedSet = new Set(query.allowedGarageIds);
      customers = customers.filter((c) => c.garageId && allowedSet.has(c.garageId));
    }

    let totalAdvanceMoney = 0;
    let totalPresentDues = 0;
    let customersWithBills = 0;
    const dashboardList: CustomerDashboardItemDto[] = [];

    for (const customer of customers) {
      const latestBill = await this.billRepo.findLatestByCustomerId(customer.id);
      const customerAdvanceMoney = Number(customer.advanceMoney) || 0;
      totalAdvanceMoney += customerAdvanceMoney;

      const customerPresentDues = latestBill
        ? Number(latestBill.presentDues)
        : customerAdvanceMoney;

      totalPresentDues += customerPresentDues;

      if (latestBill) {
        customersWithBills++;
      }

      dashboardList.push({
        id: customer.id,
        cId: customer.cId,
        customerCode: customer.customerCode,
        name: customer.name,
        mobileNumber: customer.mobileNumber,
        advanceMoney: customerAdvanceMoney,
        presentDues: customerPresentDues,
        garageId: customer.garageId,
        garageName: customer.garageName,
        isActive: customer.isActive,
        lastBillDate: latestBill ? latestBill.date : customer.createdDate,
        hasBills: Boolean(latestBill),
      });
    }

    const balance = totalAdvanceMoney - totalPresentDues;

    // Order by last bill date descending
    dashboardList.sort(
      (a, b) => new Date(b.lastBillDate).getTime() - new Date(a.lastBillDate).getTime(),
    );

    return {
      totalAdvanceMoney,
      totalPresentDues,
      balance,
      customerCount: customers.length,
      customersWithBills,
      customersWithoutBills: customers.length - customersWithBills,
      customers: dashboardList,
    };
  }
}
