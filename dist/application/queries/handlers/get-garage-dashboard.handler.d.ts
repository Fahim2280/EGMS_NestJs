import { IQueryHandler } from '@nestjs/cqrs';
import { Mapper } from '@automapper/core';
import { GetGarageDashboardQuery } from '../impl/get-garage-dashboard.query';
import { IGarageRepository, ICompanyRepository, ICustomerRepository, IElectricBillRepository } from "../../../domain/index";
import { GarageDashboardDto } from '../../dtos/garage.dto';
export declare class GetGarageDashboardHandler implements IQueryHandler<GetGarageDashboardQuery, GarageDashboardDto> {
    private readonly garageRepo;
    private readonly companyRepo;
    private readonly customerRepo;
    private readonly billRepo;
    private readonly mapper;
    constructor(garageRepo: IGarageRepository, companyRepo: ICompanyRepository, customerRepo: ICustomerRepository, billRepo: IElectricBillRepository, mapper: Mapper);
    execute(query: GetGarageDashboardQuery): Promise<GarageDashboardDto>;
}
