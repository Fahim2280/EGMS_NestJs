import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { GetElectricBillByIdQuery } from '../impl/get-electric-bill-by-id.query';
import {
  CUSTOMER_REPOSITORY_TOKEN,
  ICustomerRepository,
  ELECTRIC_BILL_REPOSITORY_TOKEN,
  IElectricBillRepository,
} from '@domain/index';
import { ElectricBillResponseDto } from '../../dtos/electric-bill.dto';

@QueryHandler(GetElectricBillByIdQuery)
export class GetElectricBillByIdHandler
  implements IQueryHandler<GetElectricBillByIdQuery>
{
  constructor(
    @Inject(ELECTRIC_BILL_REPOSITORY_TOKEN)
    private readonly billRepo: IElectricBillRepository,
    @Inject(CUSTOMER_REPOSITORY_TOKEN)
    private readonly customerRepo: ICustomerRepository,
  ) {}

  async execute(
    query: GetElectricBillByIdQuery,
  ): Promise<ElectricBillResponseDto> {
    const bill = await this.billRepo.getByIdAsync(query.id);
    if (!bill || bill.companyId !== query.companyId) {
      throw new NotFoundException('Electric bill not found.');
    }

    const customer = await this.customerRepo.getByIdAsync(bill.customerId);

    return {
      id: bill.id,
      billNumber: bill.billNumber,
      customerId: bill.customerId,
      customerName: customer?.name || 'Unknown Customer',
      customerCode: customer?.customerCode || null,
      customerCId: customer?.cId,
      companyId: bill.companyId,
      date: bill.date,
      previousUnit: bill.previousUnit,
      currentUnit: bill.currentUnit,
      totalUnit: bill.totalUnit,
      electricBill: bill.electricBill,
      previousDues: bill.previousDues,
      rentBill: bill.rentBill,
      loan: bill.loan,
      totalBill: bill.totalBill,
      clearMoney: bill.clearMoney,
      presentDues: bill.presentDues,
    };
  }
}
