import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { UpdateEmployeePermissionCommand } from '../impl/update-employee-permission.command';
import { EMPLOYEE_REPOSITORY_TOKEN, IEmployeeRepository } from '@domain/index';

@CommandHandler(UpdateEmployeePermissionCommand)
export class UpdateEmployeePermissionHandler
  implements ICommandHandler<UpdateEmployeePermissionCommand>
{
  constructor(
    @Inject(EMPLOYEE_REPOSITORY_TOKEN)
    private readonly employeeRepo: IEmployeeRepository,
  ) {}

  async execute(command: UpdateEmployeePermissionCommand): Promise<void> {
    const { employeeId, companyId, role, isActive, updatedByStamp } = command;

    const employee = await this.employeeRepo.findById(employeeId);
    if (!employee) {
      throw new NotFoundException(`Employee with ID '${employeeId}' was not found.`);
    }

    if (employee.companyId !== companyId) {
      throw new ForbiddenException(
        'You do not have administrative permission to modify permissions for this employee.',
      );
    }

    // Role validation
    const allowedRoles = ['SUPER_ADMIN', 'GENERAL'];
    if (!allowedRoles.includes(role)) {
      throw new BadRequestException(
        `Invalid role '${role}'. Valid roles are: ${allowedRoles.join(', ')}`,
      );
    }

    // Update role
    employee.updateRole(role, updatedByStamp);

    // Update active status
    if (isActive) {
      employee.activate(updatedByStamp);
    } else {
      employee.deactivate(updatedByStamp);
    }

    await this.employeeRepo.save(employee);
  }
}
