import { ICommandHandler } from '@nestjs/cqrs';
import { CreateGuarantorCommand } from '../impl/create-guarantor.command';
import { Guarantor, IGuarantorRepository, ICustomerRepository } from "../../../domain/index";
export declare class CreateGuarantorHandler implements ICommandHandler<CreateGuarantorCommand> {
    private readonly guarantorRepo;
    private readonly customerRepo;
    constructor(guarantorRepo: IGuarantorRepository, customerRepo: ICustomerRepository);
    execute(command: CreateGuarantorCommand): Promise<Guarantor>;
}
