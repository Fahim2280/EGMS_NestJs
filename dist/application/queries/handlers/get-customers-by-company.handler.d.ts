import { IQueryHandler } from '@nestjs/cqrs';
import { GetCustomersByCompanyQuery } from '../impl/get-customers-by-company.query';
import { ICustomerRepository, IGarageRepository } from "../../../domain/index";
import { CustomerResponseDto } from '../../dtos/customer.dto';
export declare class GetCustomersByCompanyHandler implements IQueryHandler<GetCustomersByCompanyQuery> {
    private readonly customerRepo;
    private readonly garageRepo?;
    constructor(customerRepo: ICustomerRepository, garageRepo?: IGarageRepository | undefined);
    execute(query: GetCustomersByCompanyQuery): Promise<CustomerResponseDto[]>;
}
