import { ICommandHandler } from '@nestjs/cqrs';
import { DeleteGuarantorCommand } from '../impl/delete-guarantor.command';
import { IGuarantorRepository } from "../../../domain/index";
export declare class DeleteGuarantorHandler implements ICommandHandler<DeleteGuarantorCommand> {
    private readonly guarantorRepo;
    constructor(guarantorRepo: IGuarantorRepository);
    execute(command: DeleteGuarantorCommand): Promise<boolean>;
}
