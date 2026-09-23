import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ConflictException, Inject, NotFoundException } from '@nestjs/common';
import { UpdateGuarantorCommand } from '../impl/update-guarantor.command';
import {
  Guarantor,
  GUARANTOR_REPOSITORY_TOKEN,
  IGuarantorRepository,
} from '@domain/index';

import { parsePhoneNumbersInput } from '../../dtos/contact-phone.dto';
import { parseDocumentsInput } from '../../dtos/attached-document.dto';

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

    const phones = parsePhoneNumbersInput(dto.phoneNumbersJson || dto.phoneNumbers, dto.mobileNumber || guarantor.mobileNumber);
    const primaryPhone = phones.find((p) => p.isPrimary) || phones[0];
    const mobileToUse = primaryPhone ? primaryPhone.number : (dto.mobileNumber || guarantor.mobileNumber);

    guarantor.updateDetails(
      dto.name,
      dto.fatherName || '',
      dto.motherName || '',
      dto.address,
      mobileToUse,
      dto.nidNumber,
      dto.relationship || '',
      actorStamp,
      phones,
    );

    if (dto.documentsJson !== undefined || dto.documents !== undefined) {
      const docs = parseDocumentsInput(dto.documentsJson || dto.documents);
      guarantor.setDocuments(docs);
    }

    await this.guarantorRepo.updateAsync(guarantor);
    return guarantor;
  }
}
