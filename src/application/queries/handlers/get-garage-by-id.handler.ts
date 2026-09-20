import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { GetGarageByIdQuery } from '../impl/get-garage-by-id.query';
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

@QueryHandler(GetGarageByIdQuery)
export class GetGarageByIdHandler implements IQueryHandler<GetGarageByIdQuery, GarageResponseDto> {
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

  async execute(query: GetGarageByIdQuery): Promise<GarageResponseDto> {
    const { id, companyId } = query;
    const garage = await this.garageRepo.getByIdAsync(id);

    if (!garage || garage.companyId !== companyId) {
      throw new NotFoundException(`Garage with ID '${id}' was not found.`);
    }

    const company = await this.companyRepo.findById(companyId);
    const customerCount = await this.customerRepo.countByGarageId(companyId, id);

    const dto = this.mapper.map(garage, Garage, GarageResponseDto);
    dto.companyName = company?.companyName;
    dto.customerCount = customerCount;

    return dto;
  }
}
