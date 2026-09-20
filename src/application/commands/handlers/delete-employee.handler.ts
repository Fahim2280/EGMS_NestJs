import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { DeleteEmployeeCommand } from '../impl/delete-employee.command';
import { EMPLOYEE_REPOSITORY_TOKEN, IEmployeeRepository } from '@domain/index';

@CommandHandler(DeleteEmployeeCommand)
export class DeleteEmployeeHandler implements ICommandHandler<DeleteEmployeeCommand> {
  constructor(
    @Inject(EMPLOYEE_REPOSITORY_TOKEN)
    private readonly employeeRepo: IEmployeeRepository,
  ) {}

  async execute(command: DeleteEmployeeCommand): Promise<void> {
    const { id, companyId, deletedByStamp } = command;

    const employee = await this.employeeRepo.findById(id);
    if (!employee) {
      throw new NotFoundException(`Employee with ID '${id}' not found.`);
    }
    if (employee.companyId !== companyId) {
      throw new ForbiddenException('You do not have permission to delete this employee.');
    }

    employee.softDelete(deletedByStamp);
    await this.employeeRepo.save(employee);
  }
}
