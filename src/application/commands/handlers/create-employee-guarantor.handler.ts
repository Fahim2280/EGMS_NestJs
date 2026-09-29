import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ConflictException, Inject, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { CreateEmployeeGuarantorCommand } from '../impl/create-employee-guarantor.command';
import {
  Guarantor,
  GUARANTOR_REPOSITORY_TOKEN,
  IGuarantorRepository,
  EMPLOYEE_REPOSITORY_TOKEN,
  IEmployeeRepository,
} from '@domain/index';

import { parsePhoneNumbersInput } from '../../dtos/contact-phone.dto';
import { parseDocumentsInput } from '../../dtos/attached-document.dto';

@CommandHandler(CreateEmployeeGuarantorCommand)
export class CreateEmployeeGuarantorHandler
  implements ICommandHandler<CreateEmployeeGuarantorCommand>
{
  constructor(
    @Inject(GUARANTOR_REPOSITORY_TOKEN)
    private readonly guarantorRepo: IGuarantorRepository,
    @Inject(EMPLOYEE_REPOSITORY_TOKEN)
    private readonly employeeRepo: IEmployeeRepository,
  ) {}

  async execute(command: CreateEmployeeGuarantorCommand): Promise<Guarantor> {
    const { companyId, employeeId, dto, actorStamp } = command;

    const employee = await this.employeeRepo.getByIdAsync(employeeId);
    if (!employee || employee.companyId !== companyId) {
      throw new NotFoundException('Employee not found or does not belong to your company.');
    }

    // Check duplicate NID for this specific employee
    const existing = await this.guarantorRepo.findByEmployeeAndNid(
      employeeId,
      dto.nidNumber,
    );
    if (existing) {
      throw new ConflictException(
        `A guarantor with NID '${dto.nidNumber}' is already registered for this employee.`,
      );
    }

    const phones = parsePhoneNumbersInput(dto.phoneNumbersJson || dto.phoneNumbers, dto.mobileNumber);
    const primaryPhone = phones.find((p) => p.isPrimary) || phones[0];
    const mobileToUse = primaryPhone ? primaryPhone.number : dto.mobileNumber;

    const guarantorId = uuidv4();
    const guarantor = Guarantor.create({
      id: guarantorId,
      employeeId,
      companyId,
      name: dto.name,
      fatherName: dto.fatherName || '',
      motherName: dto.motherName || '',
      address: dto.address,
      mobileNumber: mobileToUse,
      phoneNumbers: phones,
      documents: parseDocumentsInput(dto.documentsJson || dto.documents),
      nidNumber: dto.nidNumber,
      relationship: dto.relationship || '',
      createdBy: actorStamp || 'SYSTEM',
    });

    await this.guarantorRepo.addAsync(guarantor);
    return guarantor;
  }
}
