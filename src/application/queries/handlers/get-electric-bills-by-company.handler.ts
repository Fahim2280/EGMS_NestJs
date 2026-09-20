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
    const [bills, customers] = await Promise.all([
      this.billRepo.findByCompanyId(query.companyId),
      this.customerRepo.findByCompanyId(query.companyId),
    ]);

    const customerMap = new Map(customers.map((c) => [c.id, c.name]));

    return bills.map((b) => ({
      id: b.id,
      billNumber: b.billNumber,
      customerId: b.customerId,
      customerName: customerMap.get(b.customerId) || 'Unknown Customer',
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
    }));
  }
}
