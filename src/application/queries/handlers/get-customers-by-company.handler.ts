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
    let customers = await this.customerRepo.findByCompanyId(query.companyId);

    if (query.allowedGarageIds !== undefined && query.allowedGarageIds !== null) {
      const allowedSet = new Set(query.allowedGarageIds);
      customers = customers.filter((c) => c.garageId && allowedSet.has(c.garageId));
    }

    return customers.map((c) => ({
      id: c.id,
      cId: c.cId,
      customerCode: c.customerCode,
      companyId: c.companyId,
      name: c.name,
      fatherName: c.fatherName,
      motherName: c.motherName,
      address: c.address,
      mobileNumber: c.mobileNumber,
      phoneNumbers: c.phoneNumbers,
      nidNumber: c.nidNumber,
      previousUnit: c.previousUnit,
      advanceMoney: c.advanceMoney,
      garageId: c.garageId,
      garageName: c.garageName,
      createdDate: c.createdDate,
    }));
  }
}
