import { ICommandHandler } from '@nestjs/cqrs';
import { UpdateGarageCommand } from '../impl/update-garage.command';
import { Garage, IGarageRepository } from "../../../domain/index";
export declare class UpdateGarageHandler implements ICommandHandler<UpdateGarageCommand> {
    private readonly garageRepo;
    constructor(garageRepo: IGarageRepository);
    execute(command: UpdateGarageCommand): Promise<Garage>;
}
