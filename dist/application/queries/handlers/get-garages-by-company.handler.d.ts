import { IQueryHandler } from '@nestjs/cqrs';
import { Mapper } from '@automapper/core';
import { GetGaragesByCompanyQuery } from '../impl/get-garages-by-company.query';
import { IGarageRepository, ICompanyRepository, ICustomerRepository } from "../../../domain/index";
import { GarageResponseDto } from '../../dtos/garage.dto';
export declare class GetGaragesByCompanyHandler implements IQueryHandler<GetGaragesByCompanyQuery, GarageResponseDto[]> {
    private readonly garageRepo;
    private readonly companyRepo;
    private readonly customerRepo;
    private readonly mapper;
    constructor(garageRepo: IGarageRepository, companyRepo: ICompanyRepository, customerRepo: ICustomerRepository, mapper: Mapper);
    execute(query: GetGaragesByCompanyQuery): Promise<GarageResponseDto[]>;
}
