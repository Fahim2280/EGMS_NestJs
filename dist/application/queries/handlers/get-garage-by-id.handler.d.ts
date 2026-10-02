import { IQueryHandler } from '@nestjs/cqrs';
import { Mapper } from '@automapper/core';
import { GetGarageByIdQuery } from '../impl/get-garage-by-id.query';
import { IGarageRepository, ICompanyRepository, ICustomerRepository } from "../../../domain/index";
import { GarageResponseDto } from '../../dtos/garage.dto';
export declare class GetGarageByIdHandler implements IQueryHandler<GetGarageByIdQuery, GarageResponseDto> {
    private readonly garageRepo;
    private readonly companyRepo;
    private readonly customerRepo;
    private readonly mapper;
    constructor(garageRepo: IGarageRepository, companyRepo: ICompanyRepository, customerRepo: ICustomerRepository, mapper: Mapper);
    execute(query: GetGarageByIdQuery): Promise<GarageResponseDto>;
}
