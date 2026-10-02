import { ICommandHandler } from '@nestjs/cqrs';
import { DeleteCustomerCommand } from '../impl/delete-customer.command';
import { ICustomerRepository } from "../../../domain/index";
export declare class DeleteCustomerHandler implements ICommandHandler<DeleteCustomerCommand> {
    private readonly customerRepo;
    constructor(customerRepo: ICustomerRepository);
    execute(command: DeleteCustomerCommand): Promise<boolean>;
}
