import { ICommandHandler } from '@nestjs/cqrs';
import { CreateCustomerCommand } from '../impl/create-customer.command';
import { Customer, ICustomerRepository, IGarageRepository } from "../../../domain/index";
export declare class CreateCustomerHandler implements ICommandHandler<CreateCustomerCommand> {
    private readonly customerRepo;
    private readonly garageRepo;
    constructor(customerRepo: ICustomerRepository, garageRepo: IGarageRepository);
    execute(command: CreateCustomerCommand): Promise<Customer>;
}
