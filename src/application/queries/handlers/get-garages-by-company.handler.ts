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
} from '@domain/index';
import { GarageResponseDto } from '../../dtos/garage.dto';

@QueryHandler(GetGaragesByCompanyQuery)
export class GetGaragesByCompanyHandler implements IQueryHandler<GetGaragesByCompanyQuery, GarageResponseDto[]> {
  constructor(
    @Inject(GARAGE_REPOSITORY_TOKEN)
    private readonly garageRepo: IGarageRepository,
    @Inject(COMPANY_REPOSITORY_TOKEN)
    private readonly companyRepo: ICompanyRepository,
    @InjectMapper()
    private readonly mapper: Mapper,
  ) {}

  async execute(query: GetGaragesByCompanyQuery): Promise<GarageResponseDto[]> {
    const garages = await this.garageRepo.findByCompanyId(query.companyId);
    const company = await this.companyRepo.findById(query.companyId);

    return garages.map((g) => {
      const dto = this.mapper.map(g, Garage, GarageResponseDto);
      dto.companyName = company?.companyName;
      return dto;
    });
  }
}
