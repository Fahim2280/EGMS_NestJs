import { ICommandHandler } from '@nestjs/cqrs';
import { UpdateEmployeeCommand } from '../impl/update-employee.command';
import { IEmployeeRepository } from "../../../domain/index";
export declare class UpdateEmployeeHandler implements ICommandHandler<UpdateEmployeeCommand> {
    private readonly employeeRepo;
    constructor(employeeRepo: IEmployeeRepository);
    execute(command: UpdateEmployeeCommand): Promise<void>;
}
