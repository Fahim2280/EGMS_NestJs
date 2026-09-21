import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ConflictException, Inject, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { CreateGuarantorCommand } from '../impl/create-guarantor.command';
import {
  Guarantor,
  GUARANTOR_REPOSITORY_TOKEN,
  IGuarantorRepository,
  CUSTOMER_REPOSITORY_TOKEN,
  ICustomerRepository,
} from '@domain/index';

@CommandHandler(CreateGuarantorCommand)
export class CreateGuarantorHandler
  implements ICommandHandler<CreateGuarantorCommand>
{
  constructor(
    @Inject(GUARANTOR_REPOSITORY_TOKEN)
    private readonly guarantorRepo: IGuarantorRepository,
    @Inject(CUSTOMER_REPOSITORY_TOKEN)
    private readonly customerRepo: ICustomerRepository,
  ) {}

  async execute(command: CreateGuarantorCommand): Promise<Guarantor> {
    const { companyId, customerId, dto, actorStamp } = command;

    const customer = await this.customerRepo.getByIdAsync(customerId);
    if (!customer || customer.companyId !== companyId) {
      throw new NotFoundException('Customer not found or does not belong to your company.');
    }

    // Check duplicate NID for this specific customer
    const existing = await this.guarantorRepo.findByCustomerAndNid(
      customerId,
      dto.nidNumber,
    );
    if (existing) {
      throw new ConflictException(
        `A guarantor with NID '${dto.nidNumber}' is already registered for this customer.`,
      );
    }

    const guarantorId = uuidv4();
    const guarantor = Guarantor.create({
      id: guarantorId,
      customerId,
      companyId,
      name: dto.name,
      fatherName: dto.fatherName || '',
      motherName: dto.motherName || '',
      address: dto.address,
      mobileNumber: dto.mobileNumber,
      nidNumber: dto.nidNumber,
      relationship: dto.relationship || '',
      createdBy: actorStamp || 'SYSTEM',
    });

    await this.guarantorRepo.addAsync(guarantor);
    return guarantor;
  }
}
