import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { FileService } from '@infrastructure/services/file.service';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Request, Response } from 'express';
import { CreateEmployeeDto } from '@application/dtos/employee.dto';
import { CreateEmployeeCommand } from '@application/commands/impl/create-employee.command';
import { UpdateEmployeeCommand } from '@application/commands/impl/update-employee.command';
import { DeleteEmployeeCommand } from '@application/commands/impl/delete-employee.command';
import { UpdateEmployeePermissionCommand } from '@application/commands/impl/update-employee-permission.command';
import { GetEmployeesByCompanyQuery } from '@application/queries/impl/get-employees-by-company.query';
import { GetEmployeeByIdQuery } from '@application/queries/impl/get-employee-by-id.query';
import { GetGaragesByCompanyQuery } from '@application/queries/impl/get-garages-by-company.query';
import { JwtAuthGuard } from '@infrastructure/auth/jwt-auth.guard';
import { RolesGuard } from '@infrastructure/auth/roles.guard';
import { Roles } from '@infrastructure/auth/roles.decorator';
import { AuditLogService } from '@application/services/audit-log.service';
import { parsePhoneNumbersInput } from '@application/dtos/contact-phone.dto';

@Controller('employees')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN')
export class EmployeeController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly auditLogService: AuditLogService,
    private readonly fileService: FileService,
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
  @UseInterceptors(FilesInterceptor('files', 10, { limits: { fileSize: 25 * 1024 * 1024 } }))
  async handleCreate(
    @Req() req: Request,
    @Body() dto: CreateEmployeeDto,
    @UploadedFiles() files: any[],
    @Res() res: Response,
  ) {
    const user = (req as any).user;
    try {
      if (files && files.length > 0) {
        const uploadedDocs = await this.fileService.uploadFiles(
          files,
          'employees',
          (dto as any).documentType || 'GENERAL',
        );
        dto.documents = uploadedDocs;
      }

      await this.commandBus.execute(
        new CreateEmployeeCommand(user.companyId, dto),
      );

      await this.auditLogService.record({
        companyId: user.companyId,
        userId: user.sub || user.companyId,
        userName: user.name,
        userRole: user.role,
        action: 'CREATE',
        entityType: 'EMPLOYEE',
        entityName: dto.name,
        details: `Registered new employee ${dto.name} (${dto.email})`,
        req,
      });

      return res.redirect('/employees?success=msg.employeeCreated');
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
    const [employees, garages] = await Promise.all([
      this.queryBus.execute(new GetEmployeesByCompanyQuery(user.companyId)),
      this.queryBus.execute(new GetGaragesByCompanyQuery(user.companyId)),
    ]);

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
      garages,
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

      const canCreate =
        body.canCreate === true ||
        body.canCreate === 'true' ||
        body.canCreate === '1' ||
        body.canCreate === 'on';

      const canEdit =
        body.canEdit === true ||
        body.canEdit === 'true' ||
        body.canEdit === '1' ||
        body.canEdit === 'on';

      const canDelete =
        body.canDelete === true ||
        body.canDelete === 'true' ||
        body.canDelete === '1' ||
        body.canDelete === 'on';

      const canView =
        body.canView === undefined
          ? true
          : body.canView === true ||
            body.canView === 'true' ||
            body.canView === '1' ||
            body.canView === 'on';

      let garageIds: string[] = [];
      if (body.garageIds) {
        if (Array.isArray(body.garageIds)) {
          garageIds = body.garageIds.filter(Boolean);
        } else if (typeof body.garageIds === 'string' && body.garageIds.trim()) {
          garageIds = [body.garageIds.trim()];
        }
      }

      await this.commandBus.execute(
        new UpdateEmployeePermissionCommand(
          id,
          user.companyId,
          body.role || 'GENERAL',
          isActive,
          canCreate,
          canEdit,
          canDelete,
          canView,
          garageIds,
          `${user.companyId}|SUPER_ADMIN`,
        ),
      );

      await this.auditLogService.record({
        companyId: user.companyId,
        userId: user.sub || user.companyId,
        userName: user.name,
        userRole: user.role,
        action: 'PERMISSIONS_UPDATE',
        entityType: 'EMPLOYEE',
        entityId: id,
        details: `Updated role & permissions for employee #${id}: role=${body.role || 'GENERAL'}, active=${isActive}, canCreate=${canCreate}, canEdit=${canEdit}, canDelete=${canDelete}`,
        req,
      });

      return res.redirect(
        '/employees/permissions?success=msg.permissionsUpdated',
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
  @UseInterceptors(FilesInterceptor('files', 10, { limits: { fileSize: 25 * 1024 * 1024 } }))
  async handleEdit(
    @Param('id') id: string,
    @Body() body: any,
    @UploadedFiles() files: any[],
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const user = (req as any).user;
    try {
      const phones = parsePhoneNumbersInput(body.phoneNumbersJson || body.phoneNumbers, body.phoneNumber);
      const primaryPhone = phones.find((p) => p.isPrimary) || phones[0];
      const phoneToUse = primaryPhone ? primaryPhone.number : body.phoneNumber;

      let documentsToSet = undefined;
      if (files && files.length > 0) {
        const existingEmployee = await this.queryBus.execute(
          new GetEmployeeByIdQuery(id, user.companyId),
        );
        const uploadedDocs = await this.fileService.uploadFiles(
          files,
          'employees',
          body.documentType || 'GENERAL',
        );
        const existingDocs = existingEmployee?.documents || [];
        documentsToSet = [...existingDocs, ...uploadedDocs];
      }

      await this.commandBus.execute(
        new UpdateEmployeeCommand(
          id,
          user.companyId,
          body.name,
          body.address,
          phoneToUse,
          body.nidNumber,
          `${user.companyId}|SUPER_ADMIN`,
          phones,
          documentsToSet,
        ),
      );

      await this.auditLogService.record({
        companyId: user.companyId,
        userId: user.sub || user.companyId,
        userName: user.name,
        userRole: user.role,
        action: 'UPDATE',
        entityType: 'EMPLOYEE',
        entityId: id,
        entityName: body.name,
        details: `Updated profile details for employee ${body.name}`,
        req,
      });

      return res.redirect(`/employees/${id}?success=msg.employeeUpdated`);
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

      await this.auditLogService.record({
        companyId: user.companyId,
        userId: user.sub || user.companyId,
        userName: user.name,
        userRole: user.role,
        action: 'DELETE',
        entityType: 'EMPLOYEE',
        entityId: id,
        details: `Deleted employee record #${id}`,
        req,
      });

      return res.redirect('/employees?success=msg.employeeDeleted');
    } catch {
      return res.redirect('/employees?error=msg.genericError');
    }
  }
}
