import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Request, Response } from 'express';
import { CreateEmployeeDto } from '@application/dtos/employee.dto';
import { CreateEmployeeCommand } from '@application/commands/impl/create-employee.command';
import { UpdateEmployeeCommand } from '@application/commands/impl/update-employee.command';
import { DeleteEmployeeCommand } from '@application/commands/impl/delete-employee.command';
import { UpdateEmployeePermissionCommand } from '@application/commands/impl/update-employee-permission.command';
import { GetEmployeesByCompanyQuery } from '@application/queries/impl/get-employees-by-company.query';
import { GetEmployeeByIdQuery } from '@application/queries/impl/get-employee-by-id.query';
import { JwtAuthGuard } from '@infrastructure/auth/jwt-auth.guard';
import { RolesGuard } from '@infrastructure/auth/roles.guard';
import { Roles } from '@infrastructure/auth/roles.decorator';

@Controller('employees')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN')
export class EmployeeController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  async listEmployees(@Req() req: Request, @Res() res: Response) {
    const user = (req as any).user;
    const employees = await this.queryBus.execute(
      new GetEmployeesByCompanyQuery(user.companyId),
    );

    return res.render('employees/index', {
      title: 'Employee Roster - EGMS Portal',
      activeNav: 'employees',
      user,
      isSuperAdmin: true,
      employees,
    });
  }

  @Get('new')
  renderCreateForm(@Req() req: Request, @Res() res: Response) {
    const user = (req as any).user;
    return res.render('employees/create', {
      title: 'Add New Employee - EGMS Portal',
      activeNav: 'employees',
      user,
    });
  }

  @Post()
  async handleCreate(
    @Req() req: Request,
    @Body() dto: CreateEmployeeDto,
    @Res() res: Response,
  ) {
    const user = (req as any).user;
    try {
      await this.commandBus.execute(
        new CreateEmployeeCommand(user.companyId, dto),
      );
      return res.redirect('/employees?success=Employee+added+successfully');
    } catch (err: any) {
      return res.render('employees/create', {
        title: 'Add New Employee - EGMS Portal',
        activeNav: 'employees',
        user,
        error: err.message || 'Failed to create employee',
        formData: dto,
      });
    }
  }

  @Get('permissions')
  async listPermissions(@Req() req: Request, @Res() res: Response) {
    const user = (req as any).user;
    const employees = await this.queryBus.execute(
      new GetEmployeesByCompanyQuery(user.companyId),
    );

    const stats = {
      total: employees.length,
      superAdmins: employees.filter((e: any) => e.role === 'SUPER_ADMIN').length,
      generalStaff: employees.filter((e: any) => e.role === 'GENERAL').length,
      active: employees.filter((e: any) => e.isActive).length,
      suspended: employees.filter((e: any) => !e.isActive).length,
    };

    return res.render('employees/permissions', {
      title: 'User Permissions & Access Control - EGMS Portal',
      activeNav: 'permissions',
      user,
      isSuperAdmin: true,
      employees,
      stats,
    });
  }

  @Post(':id/permissions')
  async handleUpdatePermissions(
    @Param('id') id: string,
    @Body() body: any,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const user = (req as any).user;
    try {
      const isActive =
        body.isActive === true ||
        body.isActive === 'true' ||
        body.isActive === 'active' ||
        body.isActive === '1' ||
        body.isActive === 'on';

      await this.commandBus.execute(
        new UpdateEmployeePermissionCommand(
          id,
          user.companyId,
          body.role,
          isActive,
          `${user.companyId}|SUPER_ADMIN`,
        ),
      );

      return res.redirect(
        '/employees/permissions?success=Permissions+and+role+updated+successfully',
      );
    } catch (err: any) {
      return res.redirect(
        `/employees/permissions?error=${encodeURIComponent(
          err.message || 'Failed to update permissions',
        )}`,
      );
    }
  }

  @Get(':id')
  async viewEmployee(
    @Param('id') id: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const user = (req as any).user;
    try {
      const employee = await this.queryBus.execute(
        new GetEmployeeByIdQuery(id, user.companyId),
      );
      return res.render('employees/details', {
        title: `${employee.name} - Employee Details`,
        activeNav: 'employees',
        user,
        employee,
      });
    } catch {
      return res.redirect('/employees');
    }
  }

  @Get(':id/edit')
  async renderEditForm(
    @Param('id') id: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const user = (req as any).user;
    try {
      const employee = await this.queryBus.execute(
        new GetEmployeeByIdQuery(id, user.companyId),
      );
      return res.render('employees/edit', {
        title: `Edit ${employee.name} - EGMS Portal`,
        activeNav: 'employees',
        user,
        employee,
      });
    } catch {
      return res.redirect('/employees');
    }
  }

  @Post(':id/edit')
  async handleEdit(
    @Param('id') id: string,
    @Body() body: any,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const user = (req as any).user;
    try {
      await this.commandBus.execute(
        new UpdateEmployeeCommand(
          id,
          user.companyId,
          body.name,
          body.address,
          body.phoneNumber,
          body.nidNumber,
          `${user.companyId}|SUPER_ADMIN`,
        ),
      );
      return res.redirect(`/employees/${id}?success=Employee+updated`);
    } catch (err: any) {
      const employee = await this.queryBus.execute(
        new GetEmployeeByIdQuery(id, user.companyId),
      ).catch(() => body);
      return res.render('employees/edit', {
        title: 'Edit Employee - EGMS Portal',
        activeNav: 'employees',
        user,
        employee: { ...employee, ...body, id },
        error: err.message || 'Failed to update employee',
      });
    }
  }

  @Post(':id/delete')
  async handleDelete(
    @Param('id') id: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const user = (req as any).user;
    try {
      await this.commandBus.execute(
        new DeleteEmployeeCommand(id, user.companyId, `${user.companyId}|SUPER_ADMIN`),
      );
      return res.redirect('/employees?success=Employee+removed');
    } catch {
      return res.redirect('/employees');
    }
  }
}
