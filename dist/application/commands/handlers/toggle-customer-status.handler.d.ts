import { ICommandHandler } from '@nestjs/cqrs';
import { ToggleCustomerStatusCommand } from '../impl/toggle-customer-status.command';
import { ICustomerRepository, Customer } from "../../../domain/index";
export declare class ToggleCustomerStatusHandler implements ICommandHandler<ToggleCustomerStatusCommand> {
    private readonly customerRepo;
    constructor(customerRepo: ICustomerRepository);
    execute(command: ToggleCustomerStatusCommand): Promise<{
        customer: Customer;
        isActive: boolean;
    }>;
}
