import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { DeleteGuarantorCommand } from '../impl/delete-guarantor.command';
import {
  GUARANTOR_REPOSITORY_TOKEN,
  IGuarantorRepository,
} from '@domain/index';

@CommandHandler(DeleteGuarantorCommand)
export class DeleteGuarantorHandler
  implements ICommandHandler<DeleteGuarantorCommand>
{
  constructor(
    @Inject(GUARANTOR_REPOSITORY_TOKEN)
    private readonly guarantorRepo: IGuarantorRepository,
  ) {}

  async execute(command: DeleteGuarantorCommand): Promise<boolean> {
    const { companyId, customerId, guarantorId, actorStamp } = command;

    const guarantor = await this.guarantorRepo.getByIdAsync(guarantorId);
    if (
      !guarantor ||
      guarantor.companyId !== companyId ||
      guarantor.customerId !== customerId ||
      guarantor.isDeleted
    ) {
      throw new NotFoundException('Guarantor not found.');
    }

    return this.guarantorRepo.softDeleteAsync(guarantorId, actorStamp);
  }
}
