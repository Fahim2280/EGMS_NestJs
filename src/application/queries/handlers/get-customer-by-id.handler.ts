import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { GetCustomerByIdQuery } from '../impl/get-customer-by-id.query';
import {
  CUSTOMER_REPOSITORY_TOKEN,
  ICustomerRepository,
  ELECTRIC_BILL_REPOSITORY_TOKEN,
  IElectricBillRepository,
} from '@domain/index';
import { CustomerResponseDto } from '../../dtos/customer.dto';

@QueryHandler(GetCustomerByIdQuery)
export class GetCustomerByIdHandler
  implements IQueryHandler<GetCustomerByIdQuery>
{
  constructor(
    @Inject(CUSTOMER_REPOSITORY_TOKEN)
    private readonly customerRepo: ICustomerRepository,
    @Inject(ELECTRIC_BILL_REPOSITORY_TOKEN)
    private readonly billRepo: IElectricBillRepository,
  ) {}

  async execute(query: GetCustomerByIdQuery): Promise<CustomerResponseDto> {
    const customer = await this.customerRepo.getByIdAsync(query.id);
    if (!customer || customer.companyId !== query.companyId) {
      throw new NotFoundException('Customer not found.');
    }

    const bills = await this.billRepo.findByCustomerId(customer.id);

    return {
      id: customer.id,
      cId: customer.cId,
      companyId: customer.companyId,
      name: customer.name,
      fatherName: customer.fatherName,
      motherName: customer.motherName,
      address: customer.address,
      mobileNumber: customer.mobileNumber,
      nidNumber: customer.nidNumber,
      previousUnit: customer.previousUnit,
      advanceMoney: customer.advanceMoney,
      createdDate: customer.createdDate,
      bills: bills.map((b) => ({
        id: b.id,
        billNumber: b.billNumber,
        customerId: b.customerId,
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
      })),
    };
  }
}
