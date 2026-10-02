import { ICommandHandler } from '@nestjs/cqrs';
import { UpdateCompanyCommand } from '../impl/update-company.command';
import { ICompanyRepository } from "../../../domain/index";
export declare class UpdateCompanyHandler implements ICommandHandler<UpdateCompanyCommand> {
    private readonly companyRepo;
    constructor(companyRepo: ICompanyRepository);
    execute(command: UpdateCompanyCommand): Promise<void>;
}
