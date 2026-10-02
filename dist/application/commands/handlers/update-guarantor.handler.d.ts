import { ICommandHandler } from '@nestjs/cqrs';
import { UpdateGuarantorCommand } from '../impl/update-guarantor.command';
import { Guarantor, IGuarantorRepository } from "../../../domain/index";
export declare class UpdateGuarantorHandler implements ICommandHandler<UpdateGuarantorCommand> {
    private readonly guarantorRepo;
    constructor(guarantorRepo: IGuarantorRepository);
    execute(command: UpdateGuarantorCommand): Promise<Guarantor>;
}
