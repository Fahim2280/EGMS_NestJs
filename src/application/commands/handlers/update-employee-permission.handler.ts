import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { UpdateEmployeePermissionCommand } from '../impl/update-employee-permission.command';
import {
  EMPLOYEE_REPOSITORY_TOKEN,
  IEmployeeRepository,
  GARAGE_REPOSITORY_TOKEN,
  IGarageRepository,
} from '@domain/index';

@CommandHandler(UpdateEmployeePermissionCommand)
export class UpdateEmployeePermissionHandler
  implements ICommandHandler<UpdateEmployeePermissionCommand>
{
  constructor(
    @Inject(EMPLOYEE_REPOSITORY_TOKEN)
    private readonly employeeRepo: IEmployeeRepository,
    @Inject(GARAGE_REPOSITORY_TOKEN)
    private readonly garageRepo: IGarageRepository,
  ) {}

  async execute(command: UpdateEmployeePermissionCommand): Promise<void> {
    const {
      employeeId,
      companyId,
      role,
      isActive,
      canCreate,
      canEdit,
      canDelete,
      canView,
      garageIds,
      updatedByStamp,
    } = command;

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

    // Validate garage IDs belong to this company
    const validGarageIds: string[] = [];
    if (garageIds && Array.isArray(garageIds) && garageIds.length > 0) {
      const companyGarages = await this.garageRepo.findByCompanyId(companyId);
      const companyGarageIdSet = new Set(companyGarages.map((g) => g.id));
      for (const gid of garageIds) {
        if (gid && companyGarageIdSet.has(gid)) {
          validGarageIds.push(gid);
        }
      }
    }

    // Update role
    employee.updateRole(role, updatedByStamp);

    // Update permissions & garages
    employee.updatePermissions(
      role === 'SUPER_ADMIN' ? true : Boolean(canCreate),
      role === 'SUPER_ADMIN' ? true : Boolean(canEdit),
      role === 'SUPER_ADMIN' ? true : Boolean(canDelete),
      role === 'SUPER_ADMIN' ? true : Boolean(canView),
      validGarageIds,
      updatedByStamp,
    );

    // Update active status
    if (isActive) {
      employee.activate(updatedByStamp);
    } else {
      employee.deactivate(updatedByStamp);
    }

    await this.employeeRepo.saveWithGarages(employee, validGarageIds);
  }
}
