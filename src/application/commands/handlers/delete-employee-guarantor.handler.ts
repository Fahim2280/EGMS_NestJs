import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { DeleteEmployeeGuarantorCommand } from '../impl/delete-employee-guarantor.command';
import {
  GUARANTOR_REPOSITORY_TOKEN,
  IGuarantorRepository,
} from '@domain/index';

@CommandHandler(DeleteEmployeeGuarantorCommand)
export class DeleteEmployeeGuarantorHandler
  implements ICommandHandler<DeleteEmployeeGuarantorCommand>
{
  constructor(
    @Inject(GUARANTOR_REPOSITORY_TOKEN)
    private readonly guarantorRepo: IGuarantorRepository,
  ) {}

  async execute(command: DeleteEmployeeGuarantorCommand): Promise<boolean> {
    const { companyId, employeeId, guarantorId, actorStamp } = command;

    const guarantor = await this.guarantorRepo.getByIdAsync(guarantorId);
    if (
      !guarantor ||
      guarantor.companyId !== companyId ||
      guarantor.employeeId !== employeeId ||
      guarantor.isDeleted
    ) {
      throw new NotFoundException('Employee guarantor not found.');
    }

    return this.guarantorRepo.softDeleteAsync(guarantorId, actorStamp);
  }
}
