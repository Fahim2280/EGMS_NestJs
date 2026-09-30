import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { ToggleGarageStatusCommand } from '../impl/toggle-garage-status.command';
import {
  Garage,
  GARAGE_REPOSITORY_TOKEN,
  IGarageRepository,
} from '@domain/index';

@CommandHandler(ToggleGarageStatusCommand)
export class ToggleGarageStatusHandler implements ICommandHandler<ToggleGarageStatusCommand> {
  constructor(
    @Inject(GARAGE_REPOSITORY_TOKEN)
    private readonly garageRepo: IGarageRepository,
  ) {}

  async execute(command: ToggleGarageStatusCommand): Promise<{ garage: Garage; isActive: boolean }> {
    const { id, companyId, actorStamp } = command;

    const garage = await this.garageRepo.getByIdAsync(id);
    if (!garage || garage.companyId !== companyId) {
      throw new NotFoundException(`Garage with ID '${id}' was not found.`);
    }

    const isActive = garage.toggleStatus(actorStamp || `${companyId}|SUPER_ADMIN`);
    await this.garageRepo.updateAsync(garage);

    return { garage, isActive };
  }
}
