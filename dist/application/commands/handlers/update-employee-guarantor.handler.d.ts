import { ICommandHandler } from '@nestjs/cqrs';
import { UpdateEmployeeGuarantorCommand } from '../impl/update-employee-guarantor.command';
import { Guarantor, IGuarantorRepository } from "../../../domain/index";
export declare class UpdateEmployeeGuarantorHandler implements ICommandHandler<UpdateEmployeeGuarantorCommand> {
    private readonly guarantorRepo;
    constructor(guarantorRepo: IGuarantorRepository);
    execute(command: UpdateEmployeeGuarantorCommand): Promise<Guarantor>;
}
