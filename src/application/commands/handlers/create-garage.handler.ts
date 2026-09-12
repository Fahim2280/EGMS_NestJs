import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { CreateGarageCommand } from '../impl/create-garage.command';
import {
  COMPANY_REPOSITORY_TOKEN,
  ICompanyRepository,
  Garage,
  GARAGE_REPOSITORY_TOKEN,
  IGarageRepository,
} from '@domain/index';

@CommandHandler(CreateGarageCommand)
export class CreateGarageHandler implements ICommandHandler<CreateGarageCommand> {
  constructor(
    @Inject(GARAGE_REPOSITORY_TOKEN)
    private readonly garageRepo: IGarageRepository,
    @Inject(COMPANY_REPOSITORY_TOKEN)
    private readonly companyRepo: ICompanyRepository,
  ) {}

  async execute(command: CreateGarageCommand): Promise<Garage> {
    const { companyId, dto } = command;
    const company = await this.companyRepo.findById(companyId);
    if (!company) {
      throw new NotFoundException(`Company with ID '${companyId}' was not found.`);
    }

    const garage = Garage.create({
      id: uuidv4(),
      companyId: company.id,
      garageName: dto.garageName,
      address: dto.address,
      createdBy: `${company.id}|SUPER_ADMIN`,
    });


    await this.garageRepo.save(garage);
    return garage;
  }
}
