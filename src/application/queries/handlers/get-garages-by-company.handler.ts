import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { GetGaragesByCompanyQuery } from '../impl/get-garages-by-company.query';
import {
  GARAGE_REPOSITORY_TOKEN,
  IGarageRepository,
  Garage,
  COMPANY_REPOSITORY_TOKEN,
  ICompanyRepository,
  CUSTOMER_REPOSITORY_TOKEN,
  ICustomerRepository,
} from '@domain/index';
import { GarageResponseDto } from '../../dtos/garage.dto';

@QueryHandler(GetGaragesByCompanyQuery)
export class GetGaragesByCompanyHandler implements IQueryHandler<GetGaragesByCompanyQuery, GarageResponseDto[]> {
  constructor(
    @Inject(GARAGE_REPOSITORY_TOKEN)
    private readonly garageRepo: IGarageRepository,
    @Inject(COMPANY_REPOSITORY_TOKEN)
    private readonly companyRepo: ICompanyRepository,
    @Inject(CUSTOMER_REPOSITORY_TOKEN)
    private readonly customerRepo: ICustomerRepository,
    @InjectMapper()
    private readonly mapper: Mapper,
  ) {}

  async execute(query: GetGaragesByCompanyQuery): Promise<GarageResponseDto[]> {
    let garages = await this.garageRepo.findByCompanyId(query.companyId);

    if (query.allowedGarageIds !== undefined && query.allowedGarageIds !== null) {
      const allowedSet = new Set(query.allowedGarageIds);
      garages = garages.filter((g) => allowedSet.has(g.id));
    }

    const company = await this.companyRepo.findById(query.companyId);

    const results = await Promise.all(
      garages.map(async (g) => {
        const dto = this.mapper.map(g, Garage, GarageResponseDto);
        dto.companyName = company?.companyName;
        dto.customerCount = await this.customerRepo.countByGarageId(query.companyId, g.id);
        return dto;
      }),
    );

    return results;
  }
}
