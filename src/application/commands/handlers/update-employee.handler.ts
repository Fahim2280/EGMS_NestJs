import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { UpdateEmployeeCommand } from '../impl/update-employee.command';
import { EMPLOYEE_REPOSITORY_TOKEN, IEmployeeRepository } from '@domain/index';

@CommandHandler(UpdateEmployeeCommand)
export class UpdateEmployeeHandler implements ICommandHandler<UpdateEmployeeCommand> {
  constructor(
    @Inject(EMPLOYEE_REPOSITORY_TOKEN)
    private readonly employeeRepo: IEmployeeRepository,
  ) {}

  async execute(command: UpdateEmployeeCommand): Promise<void> {
    const { id, companyId, name, address, phoneNumber, nidNumber, updatedByStamp } = command;

    const employee = await this.employeeRepo.findById(id);
    if (!employee) {
      throw new NotFoundException(`Employee with ID '${id}' not found.`);
    }
    if (employee.companyId !== companyId) {
      throw new ForbiddenException('You do not have permission to edit this employee.');
    }

    employee.updateDetails(name, address, phoneNumber, nidNumber, updatedByStamp);
    await this.employeeRepo.save(employee);
  }
}
