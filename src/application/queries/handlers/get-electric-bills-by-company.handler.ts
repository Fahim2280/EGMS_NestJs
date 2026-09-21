import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetElectricBillsByCompanyQuery } from '../impl/get-electric-bills-by-company.query';
import {
  CUSTOMER_REPOSITORY_TOKEN,
  ICustomerRepository,
  ELECTRIC_BILL_REPOSITORY_TOKEN,
  IElectricBillRepository,
} from '@domain/index';
import { ElectricBillResponseDto } from '../../dtos/electric-bill.dto';

@QueryHandler(GetElectricBillsByCompanyQuery)
export class GetElectricBillsByCompanyHandler
  implements IQueryHandler<GetElectricBillsByCompanyQuery>
{
  constructor(
    @Inject(ELECTRIC_BILL_REPOSITORY_TOKEN)
    private readonly billRepo: IElectricBillRepository,
    @Inject(CUSTOMER_REPOSITORY_TOKEN)
    private readonly customerRepo: ICustomerRepository,
  ) {}

  async execute(
    query: GetElectricBillsByCompanyQuery,
  ): Promise<ElectricBillResponseDto[]> {
    let [bills, customers] = await Promise.all([
      this.billRepo.findByCompanyId(query.companyId),
      this.customerRepo.findByCompanyId(query.companyId),
    ]);

    if (query.allowedGarageIds !== undefined && query.allowedGarageIds !== null) {
      const allowedSet = new Set(query.allowedGarageIds);
      const allowedCustomerIds = new Set(
        customers.filter((c) => c.garageId && allowedSet.has(c.garageId)).map((c) => c.id),
      );
      bills = bills.filter((b) => allowedCustomerIds.has(b.customerId));
    }

    const customerMap = new Map(customers.map((c) => [c.id, c]));

    return bills.map((b) => {
      const cust = customerMap.get(b.customerId);
      return {
        id: b.id,
        billNumber: b.billNumber,
        customerId: b.customerId,
        customerName: cust?.name || 'Unknown Customer',
        customerCode: cust?.customerCode || null,
        customerCId: cust?.cId,
        companyId: b.companyId,
      date: b.date,
      previousUnit: b.previousUnit,
      currentUnit: b.currentUnit,
      totalUnit: b.totalUnit,
      electricBill: b.electricBill,
      previousDues: b.previousDues,
      rentBill: b.rentBill,
      loan: b.loan,
      totalBill: b.totalBill,
      clearMoney: b.clearMoney,
      presentDues: b.presentDues,
      };
    });
  }
}
