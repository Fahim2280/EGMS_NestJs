import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { UpdateGarageCommand } from '../impl/update-garage.command';
import {
  Garage,
  GARAGE_REPOSITORY_TOKEN,
  IGarageRepository,
} from '@domain/index';

@CommandHandler(UpdateGarageCommand)
export class UpdateGarageHandler implements ICommandHandler<UpdateGarageCommand> {
  constructor(
    @Inject(GARAGE_REPOSITORY_TOKEN)
    private readonly garageRepo: IGarageRepository,
  ) {}

  async execute(command: UpdateGarageCommand): Promise<Garage> {
    const { id, companyId, dto, actorStamp } = command;

    const garage = await this.garageRepo.getByIdAsync(id);
    if (!garage || garage.companyId !== companyId) {
      throw new NotFoundException(`Garage with ID '${id}' was not found.`);
    }

    garage.updateDetails(
      dto.garageName ?? garage.garageName,
      dto.address ?? garage.address,
      actorStamp || `${companyId}|SUPER_ADMIN`,
    );

    await this.garageRepo.updateAsync(garage);
    return garage;
  }
}
