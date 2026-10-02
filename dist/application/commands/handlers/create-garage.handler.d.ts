import { ICommandHandler } from '@nestjs/cqrs';
import { CreateGarageCommand } from '../impl/create-garage.command';
import { ICompanyRepository, Garage, IGarageRepository } from "../../../domain/index";
export declare class CreateGarageHandler implements ICommandHandler<CreateGarageCommand> {
    private readonly garageRepo;
    private readonly companyRepo;
    constructor(garageRepo: IGarageRepository, companyRepo: ICompanyRepository);
    execute(command: CreateGarageCommand): Promise<Garage>;
}
