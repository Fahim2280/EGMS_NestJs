import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ConflictException, Inject, NotFoundException } from '@nestjs/common';
import { UpdateGuarantorCommand } from '../impl/update-guarantor.command';
import {
  Guarantor,
  GUARANTOR_REPOSITORY_TOKEN,
  IGuarantorRepository,
} from '@domain/index';

@CommandHandler(UpdateGuarantorCommand)
export class UpdateGuarantorHandler
  implements ICommandHandler<UpdateGuarantorCommand>
{
  constructor(
    @Inject(GUARANTOR_REPOSITORY_TOKEN)
    private readonly guarantorRepo: IGuarantorRepository,
  ) {}

  async execute(command: UpdateGuarantorCommand): Promise<Guarantor> {
    const { companyId, customerId, guarantorId, dto, actorStamp } = command;

    const guarantor = await this.guarantorRepo.getByIdAsync(guarantorId);
    if (
      !guarantor ||
      guarantor.companyId !== companyId ||
      guarantor.customerId !== customerId ||
      guarantor.isDeleted
    ) {
      throw new NotFoundException('Guarantor not found.');
    }

    // Check duplicate NID excluding current guarantor
    const existing = await this.guarantorRepo.findByCustomerAndNid(
      customerId,
      dto.nidNumber,
      guarantorId,
    );
    if (existing) {
      throw new ConflictException(
        `Another guarantor with NID '${dto.nidNumber}' already exists for this customer.`,
      );
    }

    guarantor.updateDetails(
      dto.name,
      dto.fatherName || '',
      dto.motherName || '',
      dto.address,
      dto.mobileNumber,
      dto.nidNumber,
      dto.relationship || '',
      actorStamp,
    );

    await this.guarantorRepo.updateAsync(guarantor);
    return guarantor;
  }
}
