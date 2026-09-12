import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { GetCompanyByIdQuery } from '../impl/get-company-by-id.query';
import {
  COMPANY_REPOSITORY_TOKEN,
  ICompanyRepository,
  Company,
  GARAGE_REPOSITORY_TOKEN,
  IGarageRepository,
  EMPLOYEE_REPOSITORY_TOKEN,
  IEmployeeRepository,
} from '@domain/index';
import { CompanyResponseDto } from '../../dtos/company.dto';

@QueryHandler(GetCompanyByIdQuery)
export class GetCompanyByIdHandler implements IQueryHandler<GetCompanyByIdQuery, CompanyResponseDto> {
  constructor(
    @Inject(COMPANY_REPOSITORY_TOKEN)
    private readonly companyRepo: ICompanyRepository,
    @Inject(GARAGE_REPOSITORY_TOKEN)
    private readonly garageRepo: IGarageRepository,
    @Inject(EMPLOYEE_REPOSITORY_TOKEN)
    private readonly employeeRepo: IEmployeeRepository,
    @InjectMapper()
    private readonly mapper: Mapper,
  ) {}

  async execute(query: GetCompanyByIdQuery): Promise<CompanyResponseDto> {
    const company = await this.companyRepo.findById(query.id);
    if (!company) {
      throw new NotFoundException(`Company with ID '${query.id}' was not found.`);
    }

    const dto = this.mapper.map(company, Company, CompanyResponseDto);
    dto.garages = await this.garageRepo.findByCompanyId(company.id);
    dto.employeeCount = await this.employeeRepo.countByCompanyId(company.id);
    return dto;
  }
}
