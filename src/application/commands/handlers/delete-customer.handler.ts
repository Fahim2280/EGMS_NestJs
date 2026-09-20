import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { DeleteCustomerCommand } from '../impl/delete-customer.command';
import {
  CUSTOMER_REPOSITORY_TOKEN,
  ICustomerRepository,
} from '@domain/index';

@CommandHandler(DeleteCustomerCommand)
export class DeleteCustomerHandler implements ICommandHandler<DeleteCustomerCommand> {
  constructor(
    @Inject(CUSTOMER_REPOSITORY_TOKEN)
    private readonly customerRepo: ICustomerRepository,
  ) {}

  async execute(command: DeleteCustomerCommand): Promise<boolean> {
    const { id, companyId, actorStamp } = command;

    const customer = await this.customerRepo.getByIdAsync(id);
    if (!customer || customer.companyId !== companyId) {
      throw new NotFoundException('Customer not found.');
    }

    customer.softDelete(actorStamp || `${companyId}|SUPER_ADMIN`);
    await this.customerRepo.updateAsync(customer);
    return true;
  }
}
