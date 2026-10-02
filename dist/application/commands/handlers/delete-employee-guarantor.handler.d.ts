import { ICommandHandler } from '@nestjs/cqrs';
import { DeleteEmployeeGuarantorCommand } from '../impl/delete-employee-guarantor.command';
import { IGuarantorRepository } from "../../../domain/index";
export declare class DeleteEmployeeGuarantorHandler implements ICommandHandler<DeleteEmployeeGuarantorCommand> {
    private readonly guarantorRepo;
    constructor(guarantorRepo: IGuarantorRepository);
    execute(command: DeleteEmployeeGuarantorCommand): Promise<boolean>;
}
