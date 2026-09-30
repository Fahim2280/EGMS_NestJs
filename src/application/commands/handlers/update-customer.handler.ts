import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException, ConflictException, Inject, NotFoundException } from '@nestjs/common';
import { UpdateCustomerCommand } from '../impl/update-customer.command';
import {
  Customer,
  CUSTOMER_REPOSITORY_TOKEN,
  ICustomerRepository,
  GARAGE_REPOSITORY_TOKEN,
  IGarageRepository,
} from '@domain/index';

import { parsePhoneNumbersInput } from '../../dtos/contact-phone.dto';
import { parseDocumentsInput } from '../../dtos/attached-document.dto';

@CommandHandler(UpdateCustomerCommand)
export class UpdateCustomerHandler implements ICommandHandler<UpdateCustomerCommand> {
  constructor(
    @Inject(CUSTOMER_REPOSITORY_TOKEN)
    private readonly customerRepo: ICustomerRepository,
    @Inject(GARAGE_REPOSITORY_TOKEN)
    private readonly garageRepo: IGarageRepository,
  ) {}

  async execute(command: UpdateCustomerCommand): Promise<Customer> {
    const { id, companyId, dto, actorStamp } = command;

    const customer = await this.customerRepo.getByIdAsync(id);
    if (!customer || customer.companyId !== companyId) {
      throw new NotFoundException('Customer not found.');
    }

    if (dto.garageId) {
      const garage = await this.garageRepo.getByIdAsync(dto.garageId);
      if (!garage || garage.companyId !== companyId) {
        throw new NotFoundException('The selected garage does not exist or does not belong to your company.');
      }
      if (dto.garageId !== customer.garageId && garage.isActive === false) {
        throw new BadRequestException('msg.garageSuspendedCustomerBlocked');
      }
    }

    const existingNid = await this.customerRepo.findByNid(companyId, dto.nidNumber, id);
    if (existingNid) {
      throw new ConflictException(`Another customer with NID '${dto.nidNumber}' already exists.`);
    }

    // Parse phone numbers and check uniqueness within company
    const phones = parsePhoneNumbersInput(dto.phoneNumbersJson || dto.phoneNumbers, dto.mobileNumber || customer.mobileNumber);
    const primaryPhone = phones.find((p) => p.isPrimary) || phones[0];
    const mobileToUse = primaryPhone ? primaryPhone.number : (dto.mobileNumber || customer.mobileNumber);

    for (const ph of phones) {
      const existingMobile = await this.customerRepo.findByMobile(companyId, ph.number, id);
      if (existingMobile) {
        throw new ConflictException(`Another customer with phone '${ph.number}' already exists.`);
      }
    }

    // Check unique customerCode (excluding self, only among active records)
    if (dto.customerCode && dto.customerCode.trim()) {
      const existingCode = await this.customerRepo.findByCustomerCode(companyId, dto.customerCode.trim(), id);
      if (existingCode) {
        throw new ConflictException(`Customer ID '${dto.customerCode.trim()}' is already in use. Choose another.`);
      }
    }

    customer.updateDetails(
      dto.name,
      dto.fatherName || '',
      dto.motherName || '',
      dto.address,
      mobileToUse,
      dto.nidNumber,
      dto.previousUnit,
      dto.advanceMoney,
      dto.garageId,
      dto.customerCode?.trim() || null,
      actorStamp || `${companyId}|SUPER_ADMIN`,
      phones,
    );

    if (dto.documentsJson !== undefined || dto.documents !== undefined) {
      const docs = parseDocumentsInput(dto.documentsJson || dto.documents);
      customer.setDocuments(docs);
    }

    await this.customerRepo.updateAsync(customer);
    return customer;
  }
}
