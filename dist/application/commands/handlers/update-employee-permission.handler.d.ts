import { ICommandHandler } from '@nestjs/cqrs';
import { UpdateEmployeePermissionCommand } from '../impl/update-employee-permission.command';
import { IEmployeeRepository, IGarageRepository } from "../../../domain/index";
export declare class UpdateEmployeePermissionHandler implements ICommandHandler<UpdateEmployeePermissionCommand> {
    private readonly employeeRepo;
    private readonly garageRepo;
    constructor(employeeRepo: IEmployeeRepository, garageRepo: IGarageRepository);
    execute(command: UpdateEmployeePermissionCommand): Promise<void>;
}
