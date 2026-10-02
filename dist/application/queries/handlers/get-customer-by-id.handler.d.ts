import { IQueryHandler } from '@nestjs/cqrs';
import { GetCustomerByIdQuery } from '../impl/get-customer-by-id.query';
import { ICustomerRepository, IElectricBillRepository, IGuarantorRepository, IGarageRepository } from "../../../domain/index";
import { CustomerResponseDto } from '../../dtos/customer.dto';
export declare class GetCustomerByIdHandler implements IQueryHandler<GetCustomerByIdQuery> {
    private readonly customerRepo;
    private readonly billRepo;
    private readonly guarantorRepo;
    private readonly garageRepo?;
    constructor(customerRepo: ICustomerRepository, billRepo: IElectricBillRepository, guarantorRepo: IGuarantorRepository, garageRepo?: IGarageRepository | undefined);
    execute(query: GetCustomerByIdQuery): Promise<CustomerResponseDto>;
}
