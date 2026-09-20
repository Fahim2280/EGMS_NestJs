import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ConflictException, Inject, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { CreateCustomerCommand } from '../impl/create-customer.command';
import {
  Customer,
  CUSTOMER_REPOSITORY_TOKEN,
  ICustomerRepository,
  GARAGE_REPOSITORY_TOKEN,
  IGarageRepository,
} from '@domain/index';

@CommandHandler(CreateCustomerCommand)
export class CreateCustomerHandler implements ICommandHandler<CreateCustomerCommand> {
  constructor(
    @Inject(CUSTOMER_REPOSITORY_TOKEN)
    private readonly customerRepo: ICustomerRepository,
    @Inject(GARAGE_REPOSITORY_TOKEN)
    private readonly garageRepo: IGarageRepository,
  ) {}

  async execute(command: CreateCustomerCommand): Promise<Customer> {
    const { companyId, dto, actorStamp } = command;

    // Validate Garage existence and tenant isolation
    if (dto.garageId) {
      const garage = await this.garageRepo.getByIdAsync(dto.garageId);
      if (!garage || garage.companyId !== companyId) {
        throw new NotFoundException('The selected garage does not exist or does not belong to your company.');
      }
    }

    // Check unique NID within company
    const existingNid = await this.customerRepo.findByNid(companyId, dto.nidNumber);
    if (existingNid) {
      throw new ConflictException(`A customer with NID '${dto.nidNumber}' already exists.`);
    }

    // Check unique Mobile within company
    const existingMobile = await this.customerRepo.findByMobile(companyId, dto.mobileNumber);
    if (existingMobile) {
      throw new ConflictException(`A customer with mobile number '${dto.mobileNumber}' already exists.`);
    }

    const customerCount = await this.customerRepo.countByCompanyId(companyId);
    const customerId = uuidv4();

    const customer = Customer.create({
      id: customerId,
      cId: customerCount + 1,
      companyId,
      name: dto.name,
      fatherName: dto.fatherName || '',
      motherName: dto.motherName || '',
      address: dto.address,
      mobileNumber: dto.mobileNumber,
      nidNumber: dto.nidNumber,
      previousUnit: dto.previousUnit,
      advanceMoney: dto.advanceMoney,
      garageId: dto.garageId,
      createdBy: actorStamp || `${companyId}|SUPER_ADMIN`,
    });

    await this.customerRepo.save(customer);
    return customer;
  }
}
