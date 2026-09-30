import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetCustomersByCompanyQuery } from '../impl/get-customers-by-company.query';
import {
  CUSTOMER_REPOSITORY_TOKEN,
  ICustomerRepository,
  GARAGE_REPOSITORY_TOKEN,
  IGarageRepository,
} from '@domain/index';
import { CustomerResponseDto } from '../../dtos/customer.dto';

@QueryHandler(GetCustomersByCompanyQuery)
export class GetCustomersByCompanyHandler
  implements IQueryHandler<GetCustomersByCompanyQuery>
{
  constructor(
    @Inject(CUSTOMER_REPOSITORY_TOKEN)
    private readonly customerRepo: ICustomerRepository,
    @Inject(GARAGE_REPOSITORY_TOKEN)
    private readonly garageRepo?: IGarageRepository,
  ) {}

  async execute(query: GetCustomersByCompanyQuery): Promise<CustomerResponseDto[]> {
    const [rawCustomers, garages] = await Promise.all([
      this.customerRepo.findByCompanyId(query.companyId),
      this.garageRepo ? this.garageRepo.findByCompanyId(query.companyId) : Promise.resolve([]),
    ]);

    let customers = rawCustomers;
    if (query.allowedGarageIds !== undefined && query.allowedGarageIds !== null) {
      const allowedSet = new Set(query.allowedGarageIds);
      customers = customers.filter((c) => c.garageId && allowedSet.has(c.garageId));
    }

    const garageMap = new Map((garages || []).map((g) => [g.id, g]));

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
      documents: c.documents,
      nidNumber: c.nidNumber,
      previousUnit: c.previousUnit,
      advanceMoney: c.advanceMoney,
      garageId: c.garageId,
      garageName: c.garageName || (c.garageId ? garageMap.get(c.garageId)?.garageName : undefined),
      isActive: c.isActive,
      isGarageSuspended: c.garageId ? (garageMap.get(c.garageId)?.isActive === false) : false,
      createdDate: c.createdDate,
    }));
  }
}
