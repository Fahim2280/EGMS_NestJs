import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ConflictException, Inject, NotFoundException } from '@nestjs/common';
import { UpdateEmployeeGuarantorCommand } from '../impl/update-employee-guarantor.command';
import {
  Guarantor,
  GUARANTOR_REPOSITORY_TOKEN,
  IGuarantorRepository,
} from '@domain/index';

import { parsePhoneNumbersInput } from '../../dtos/contact-phone.dto';
import { parseDocumentsInput } from '../../dtos/attached-document.dto';

@CommandHandler(UpdateEmployeeGuarantorCommand)
export class UpdateEmployeeGuarantorHandler
  implements ICommandHandler<UpdateEmployeeGuarantorCommand>
{
  constructor(
    @Inject(GUARANTOR_REPOSITORY_TOKEN)
    private readonly guarantorRepo: IGuarantorRepository,
  ) {}

  async execute(command: UpdateEmployeeGuarantorCommand): Promise<Guarantor> {
    const { companyId, employeeId, guarantorId, dto, actorStamp } = command;

    const guarantor = await this.guarantorRepo.getByIdAsync(guarantorId);
    if (
      !guarantor ||
      guarantor.companyId !== companyId ||
      guarantor.employeeId !== employeeId ||
      guarantor.isDeleted
    ) {
      throw new NotFoundException('Employee guarantor not found.');
    }

    // Check duplicate NID excluding current guarantor
    const existing = await this.guarantorRepo.findByEmployeeAndNid(
      employeeId,
      dto.nidNumber,
      guarantorId,
    );
    if (existing) {
      throw new ConflictException(
        `Another guarantor with NID '${dto.nidNumber}' already exists for this employee.`,
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
