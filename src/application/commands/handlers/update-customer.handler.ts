import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ConflictException, Inject, NotFoundException } from '@nestjs/common';
import { UpdateCustomerCommand } from '../impl/update-customer.command';
import {
  Customer,
  CUSTOMER_REPOSITORY_TOKEN,
  ICustomerRepository,
  GARAGE_REPOSITORY_TOKEN,
  IGarageRepository,
} from '@domain/index';

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
    }

    const existingNid = await this.customerRepo.findByNid(companyId, dto.nidNumber, id);
    if (existingNid) {
      throw new ConflictException(`Another customer with NID '${dto.nidNumber}' already exists.`);
    }

    const existingMobile = await this.customerRepo.findByMobile(companyId, dto.mobileNumber, id);
    if (existingMobile) {
      throw new ConflictException(`Another customer with mobile '${dto.mobileNumber}' already exists.`);
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
      dto.mobileNumber,
      dto.nidNumber,
      dto.previousUnit,
      dto.advanceMoney,
      dto.garageId,
      dto.customerCode?.trim() || null,
      actorStamp || `${companyId}|SUPER_ADMIN`,
    );

    await this.customerRepo.updateAsync(customer);
    return customer;
  }
}
