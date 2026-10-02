import { ICommandHandler } from '@nestjs/cqrs';
import { CreateEmployeeGuarantorCommand } from '../impl/create-employee-guarantor.command';
import { Guarantor, IGuarantorRepository, IEmployeeRepository } from "../../../domain/index";
export declare class CreateEmployeeGuarantorHandler implements ICommandHandler<CreateEmployeeGuarantorCommand> {
    private readonly guarantorRepo;
    private readonly employeeRepo;
    constructor(guarantorRepo: IGuarantorRepository, employeeRepo: IEmployeeRepository);
    execute(command: CreateEmployeeGuarantorCommand): Promise<Guarantor>;
}
