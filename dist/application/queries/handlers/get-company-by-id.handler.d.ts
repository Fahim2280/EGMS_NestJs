import { IQueryHandler } from '@nestjs/cqrs';
import { Mapper } from '@automapper/core';
import { GetCompanyByIdQuery } from '../impl/get-company-by-id.query';
import { ICompanyRepository, IGarageRepository, IEmployeeRepository } from "../../../domain/index";
import { CompanyResponseDto } from '../../dtos/company.dto';
export declare class GetCompanyByIdHandler implements IQueryHandler<GetCompanyByIdQuery, CompanyResponseDto> {
    private readonly companyRepo;
    private readonly garageRepo;
    private readonly employeeRepo;
    private readonly mapper;
    constructor(companyRepo: ICompanyRepository, garageRepo: IGarageRepository, employeeRepo: IEmployeeRepository, mapper: Mapper);
    execute(query: GetCompanyByIdQuery): Promise<CompanyResponseDto>;
}
