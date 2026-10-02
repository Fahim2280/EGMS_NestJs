import { ICommandHandler } from '@nestjs/cqrs';
import { ToggleGarageStatusCommand } from '../impl/toggle-garage-status.command';
import { Garage, IGarageRepository } from "../../../domain/index";
export declare class ToggleGarageStatusHandler implements ICommandHandler<ToggleGarageStatusCommand> {
    private readonly garageRepo;
    constructor(garageRepo: IGarageRepository);
    execute(command: ToggleGarageStatusCommand): Promise<{
        garage: Garage;
        isActive: boolean;
    }>;
}
