import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { GetCustomerByIdQuery } from '../impl/get-customer-by-id.query';
import {
  CUSTOMER_REPOSITORY_TOKEN,
  ICustomerRepository,
  ELECTRIC_BILL_REPOSITORY_TOKEN,
  IElectricBillRepository,
  GUARANTOR_REPOSITORY_TOKEN,
  IGuarantorRepository,
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
    @Inject(GUARANTOR_REPOSITORY_TOKEN)
    private readonly guarantorRepo: IGuarantorRepository,
  ) {}

  async execute(query: GetCustomerByIdQuery): Promise<CustomerResponseDto> {
    const customer = await this.customerRepo.getByIdAsync(query.id);
    if (!customer || customer.companyId !== query.companyId) {
      throw new NotFoundException('Customer not found.');
    }

    const [bills, guarantors] = await Promise.all([
      this.billRepo.findByCustomerId(customer.id),
      this.guarantorRepo.findByCustomerId(customer.id),
    ]);

    return {
      id: customer.id,
      cId: customer.cId,
      customerCode: customer.customerCode,
      companyId: customer.companyId,
      name: customer.name,
      fatherName: customer.fatherName,
      motherName: customer.motherName,
      address: customer.address,
      mobileNumber: customer.mobileNumber,
      phoneNumbers: customer.phoneNumbers,
      documents: customer.documents || [],
      nidNumber: customer.nidNumber,
      previousUnit: customer.previousUnit,
      advanceMoney: customer.advanceMoney,
      garageId: customer.garageId,
      garageName: customer.garageName,
      isActive: customer.isActive,
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
      guarantors: guarantors.map((g) => ({
        id: g.id,
        customerId: g.customerId,
        companyId: g.companyId,
        name: g.name,
        fatherName: g.fatherName,
        motherName: g.motherName,
        address: g.address,
        mobileNumber: g.mobileNumber,
        phoneNumbers: g.phoneNumbers,
        documents: g.documents || [],
        nidNumber: g.nidNumber,
        relationship: g.relationship,
        createdDate: g.createdDate,
      })),
    };
  }
}
