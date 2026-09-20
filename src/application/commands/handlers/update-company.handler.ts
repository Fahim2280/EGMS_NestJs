import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { UpdateCompanyCommand } from '../impl/update-company.command';
import { COMPANY_REPOSITORY_TOKEN, ICompanyRepository } from '@domain/index';

@CommandHandler(UpdateCompanyCommand)
export class UpdateCompanyHandler implements ICommandHandler<UpdateCompanyCommand> {
  constructor(
    @Inject(COMPANY_REPOSITORY_TOKEN)
    private readonly companyRepo: ICompanyRepository,
  ) {}

  async execute(command: UpdateCompanyCommand): Promise<void> {
    const { companyId, name, companyName, phoneNumber, address, updatedByStamp, unitRate } = command;

    const company = await this.companyRepo.getByIdAsync(companyId);
    if (!company) {
      throw new NotFoundException(`Company with ID '${companyId}' not found.`);
    }

    const actorRole = updatedByStamp?.split('|')[1] || '';
    const effectiveUnitRate = actorRole === 'SUPER_ADMIN' ? unitRate : undefined;

    company.updateDetails(name, companyName, phoneNumber, address, effectiveUnitRate, updatedByStamp);
    await this.companyRepo.updateAsync(company);
  }
}
