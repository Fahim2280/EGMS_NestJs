import { ICommandHandler } from '@nestjs/cqrs';
import { CreateEmployeeCommand } from '../impl/create-employee.command';
import { ICompanyRepository, Employee, IEmployeeRepository } from "../../../domain/index";
export declare class CreateEmployeeHandler implements ICommandHandler<CreateEmployeeCommand> {
    private readonly employeeRepo;
    private readonly companyRepo;
    constructor(employeeRepo: IEmployeeRepository, companyRepo: ICompanyRepository);
    execute(command: CreateEmployeeCommand): Promise<Employee>;
}
