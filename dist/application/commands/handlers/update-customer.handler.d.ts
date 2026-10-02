import { ICommandHandler } from '@nestjs/cqrs';
import { UpdateCustomerCommand } from '../impl/update-customer.command';
import { Customer, ICustomerRepository, IGarageRepository } from "../../../domain/index";
export declare class UpdateCustomerHandler implements ICommandHandler<UpdateCustomerCommand> {
    private readonly customerRepo;
    private readonly garageRepo;
    constructor(customerRepo: ICustomerRepository, garageRepo: IGarageRepository);
    execute(command: UpdateCustomerCommand): Promise<Customer>;
}
