import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetCustomersByCompanyQuery } from '../impl/get-customers-by-company.query';
import {
  CUSTOMER_REPOSITORY_TOKEN,
  ICustomerRepository,
} from '@domain/index';
import { CustomerResponseDto } from '../../dtos/customer.dto';

@QueryHandler(GetCustomersByCompanyQuery)
export class GetCustomersByCompanyHandler
  implements IQueryHandler<GetCustomersByCompanyQuery>
{
  constructor(
    @Inject(CUSTOMER_REPOSITORY_TOKEN)
    private readonly customerRepo: ICustomerRepository,
  ) {}

  async execute(query: GetCustomersByCompanyQuery): Promise<CustomerResponseDto[]> {
    const customers = await this.customerRepo.findByCompanyId(query.companyId);

    return customers.map((c) => ({
      id: c.id,
      cId: c.cId,
      companyId: c.companyId,
      name: c.name,
      fatherName: c.fatherName,
      motherName: c.motherName,
      address: c.address,
      mobileNumber: c.mobileNumber,
      nidNumber: c.nidNumber,
      previousUnit: c.previousUnit,
      advanceMoney: c.advanceMoney,
      createdDate: c.createdDate,
    }));
  }
}
