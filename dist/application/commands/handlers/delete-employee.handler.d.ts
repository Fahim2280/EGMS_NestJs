import { ICommandHandler } from '@nestjs/cqrs';
import { DeleteEmployeeCommand } from '../impl/delete-employee.command';
import { IEmployeeRepository } from "../../../domain/index";
export declare class DeleteEmployeeHandler implements ICommandHandler<DeleteEmployeeCommand> {
    private readonly employeeRepo;
    constructor(employeeRepo: IEmployeeRepository);
    execute(command: DeleteEmployeeCommand): Promise<void>;
}
