import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { ToggleCustomerStatusCommand } from '../impl/toggle-customer-status.command';
import {
  CUSTOMER_REPOSITORY_TOKEN,
  ICustomerRepository,
  Customer,
} from '@domain/index';

@CommandHandler(ToggleCustomerStatusCommand)
export class ToggleCustomerStatusHandler implements ICommandHandler<ToggleCustomerStatusCommand> {
  constructor(
    @Inject(CUSTOMER_REPOSITORY_TOKEN)
    private readonly customerRepo: ICustomerRepository,
  ) {}

  async execute(command: ToggleCustomerStatusCommand): Promise<{ customer: Customer; isActive: boolean }> {
    const { id, companyId, actorStamp } = command;

    const customer = await this.customerRepo.getByIdAsync(id);
    if (!customer || customer.companyId !== companyId) {
      throw new NotFoundException('Customer not found.');
    }

    const isActive = customer.toggleStatus(actorStamp || `${companyId}|SUPER_ADMIN`);
    await this.customerRepo.updateAsync(customer);

    return { customer, isActive };
  }
}
