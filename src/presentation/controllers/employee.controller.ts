import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { FilesInterceptor, AnyFilesInterceptor } from '@nestjs/platform-express';
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
import { CreateGuarantorDto, UpdateGuarantorDto } from '@application/dtos/guarantor.dto';
import { CreateEmployeeGuarantorCommand } from '@application/commands/impl/create-employee-guarantor.command';
import { UpdateEmployeeGuarantorCommand } from '@application/commands/impl/update-employee-guarantor.command';
import { DeleteEmployeeGuarantorCommand } from '@application/commands/impl/delete-employee-guarantor.command';
import { GetGuarantorsByEmployeeQuery } from '@application/queries/impl/get-guarantors-by-employee.query';
import {
  GUARANTOR_REPOSITORY_TOKEN,
  IGuarantorRepository,
} from '@domain/index';

@Controller('employees')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN')
export class EmployeeController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly auditLogService: AuditLogService,
    private readonly fileService: FileService,
    @Inject(GUARANTOR_REPOSITORY_TOKEN)
    private readonly guarantorRepo: IGuarantorRepository,
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
  @UseInterceptors(AnyFilesInterceptor({ limits: { fileSize: 25 * 1024 * 1024 } }))
  async handleCreate(
    @Req() req: Request,
    @Body() dto: CreateEmployeeDto,
    @UploadedFiles() files: any[],
    @Res() res: Response,
  ) {
    const user = (req as any).user;
    try {
      // Process multi-category document slots (employeeDocFiles_0, employeeDocFiles_1, ...) + legacy 'files'
      const employeeUploadedDocs: any[] = [];
      const MAX_DOC_SLOTS = 15;
      for (let i = 0; i < MAX_DOC_SLOTS; i++) {
        const slotFieldName = `employeeDocFiles_${i}`;
        const slotFiles = (files || []).filter((f: any) => f.fieldname === slotFieldName);
        if (slotFiles.length > 0) {
          const rawTag = (dto as any)[`employeeDocType_${i}`] || (req.body && req.body[`employeeDocType_${i}`]) || 'GENERAL';
          const tags = slotFiles.map(() => rawTag);
          const uploaded = await this.fileService.uploadFiles(
            slotFiles,
            'employees',
            tags,
            `${user.sub || user.companyId}|${user.role || 'SUPER_ADMIN'}`,
          );
          employeeUploadedDocs.push(...uploaded);
        }
      }

      // Legacy fallback: single 'files' field upload
      const legacyEmployeeFiles = (files || []).filter((f: any) => f.fieldname === 'files');
      if (legacyEmployeeFiles.length > 0) {
        const uploadedDocs = await this.fileService.uploadFiles(
          legacyEmployeeFiles,
          'employees',
          (dto as any).documentType || 'GENERAL',
          `${user.sub || user.companyId}|${user.role || 'SUPER_ADMIN'}`,
        );
        employeeUploadedDocs.push(...uploadedDocs);
      }

      // Process dedicated profile picture avatar upload (avatarFile)
      const avatarFile = (files || []).find((f: any) => f.fieldname === 'avatarFile' || f.fieldname === 'profilePicture');
      if (avatarFile && avatarFile.buffer && avatarFile.buffer.length > 0) {
        try {
          const uploadedPhoto = await this.fileService.uploadFile(
            avatarFile,
            'employees',
            'PHOTO',
            `${user.sub || user.companyId}|${user.role || 'SUPER_ADMIN'}`,
          );
          employeeUploadedDocs.unshift(uploadedPhoto);
        } catch (photoErr: any) {
          console.warn('Employee avatar upload failed:', photoErr?.message);
        }
      }

      if (employeeUploadedDocs.length > 0) {
        dto.documents = employeeUploadedDocs;
      }

      const createdEmployee = await this.commandBus.execute(
        new CreateEmployeeCommand(user.companyId, dto),
      );

      // Create initial guarantor(s) if provided on employee registration form
      const guarantorsToCreate: CreateGuarantorDto[] = [];
      if (dto.guarantorsJson) {
        try {
          const parsed = typeof dto.guarantorsJson === 'string' ? JSON.parse(dto.guarantorsJson) : dto.guarantorsJson;
          if (Array.isArray(parsed)) {
            for (const g of parsed) {
              if (g && g.name && g.name.trim() && g.nidNumber && g.nidNumber.trim()) {
                guarantorsToCreate.push({
                  name: g.name.trim(),
                  relationship: g.relationship?.trim(),
                  mobileNumber: g.mobileNumber?.trim() || g.phoneNumber?.trim(),
                  phoneNumbers: g.phoneNumbers,
                  phoneNumbersJson: g.phoneNumbersJson || (g.phoneNumbers ? JSON.stringify(g.phoneNumbers) : undefined),
                  documentType: g.documentType,
                  nidNumber: g.nidNumber.trim(),
                  fatherName: g.fatherName?.trim(),
                  motherName: g.motherName?.trim(),
                  address: g.address?.trim() || dto.address,
                });
              }
            }
          }
        } catch (e) {
          // ignore parse error, fallback to flat fields below
        }
      }

      if (
        guarantorsToCreate.length === 0 &&
        dto.guarantorName &&
        dto.guarantorName.trim() &&
        dto.guarantorNidNumber &&
        dto.guarantorNidNumber.trim()
      ) {
        guarantorsToCreate.push({
          name: dto.guarantorName.trim(),
          relationship: dto.guarantorRelationship?.trim(),
          mobileNumber: dto.guarantorMobileNumber?.trim(),
          phoneNumbersJson: dto.guarantorPhoneNumbersJson,
          documentType: dto.guarantorDocumentType || (req.body as any)?.guarantorDocType_0 || (req.body as any)?.guarantorDocumentType || 'GENERAL',
          nidNumber: dto.guarantorNidNumber.trim(),
          fatherName: dto.guarantorFatherName?.trim(),
          motherName: dto.guarantorMotherName?.trim(),
          address: dto.guarantorAddress?.trim() || dto.address,
        });
      }

      // Track created guarantors with their index for file upload
      const createdGuarantors: Array<{ index: number; guarantor: any }> = [];
      for (let gi = 0; gi < guarantorsToCreate.length; gi++) {
        const gDto = guarantorsToCreate[gi];
        try {
          const guarantor = await this.commandBus.execute(
            new CreateEmployeeGuarantorCommand(
              user.companyId,
              createdEmployee.id,
              gDto,
              `${user.sub || user.companyId}|${user.role || 'SUPER_ADMIN'}`,
            ),
          );
          createdGuarantors.push({ index: gi, guarantor });
        } catch (gErr: any) {
          console.warn(`Failed to create initial guarantor for employee ${createdEmployee.id}:`, gErr?.message);
        }
      }

      // Upload per-guarantor documents (both multi-slot guarantor_${index}_docFiles_${slot} and legacy guarantorFiles_${index})
      for (const { index, guarantor } of createdGuarantors) {
        const gFilesToUpload: any[] = [];
        const gFileCategories: string[] = [];

        // Check categorized slots for this guarantor (slots 0..15)
        for (let s = 0; s < 15; s++) {
          const slotFiles = (files || []).filter((f: any) => f.fieldname === `guarantor_${index}_docFiles_${s}`);
          if (slotFiles.length > 0) {
            const slotCat = ((req.body as any)?.[`guarantor_${index}_docType_${s}`] || 'GENERAL').trim();
            for (const f of slotFiles) {
              gFilesToUpload.push(f);
              gFileCategories.push(slotCat);
            }
          }
        }

        // Legacy fallback: guarantorFiles_${index}
        const legacyGFiles = (files || []).filter((f: any) => f.fieldname === `guarantorFiles_${index}`);
        if (legacyGFiles.length > 0) {
          const rawDocType = ((req.body as any)?.[`guarantorDocType_${index}`] || guarantorsToCreate[index]?.documentType || 'GENERAL').trim();
          for (const f of legacyGFiles) {
            gFilesToUpload.push(f);
            gFileCategories.push(rawDocType);
          }
        }

        if (gFilesToUpload.length > 0) {
          try {
            const uploadedDocs = await this.fileService.uploadFiles(
              gFilesToUpload,
              'guarantors',
              gFileCategories,
              user.name || user.email,
            );
            for (const doc of uploadedDocs) {
              guarantor.addDocument(doc);
            }
            await this.guarantorRepo.updateAsync(guarantor);
          } catch (docErr: any) {
            console.warn(`Failed to upload docs for guarantor index ${index}:`, docErr?.message);
          }
        }
      }

      await this.auditLogService.record({
        companyId: user.companyId,
        userId: user.sub || user.companyId,
        userName: user.name,
        userRole: user.role,
        action: 'CREATE',
        entityType: 'EMPLOYEE',
        entityId: createdEmployee?.id || undefined,
        entityName: dto.name,
        details: `Registered new employee ${dto.name} (${dto.email})${guarantorsToCreate.length > 0 ? ` with ${guarantorsToCreate.length} guarantor(s)` : ''}`,
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

    const isBn = (req as any).lang === 'bn' || req.cookies?.lang === 'bn';

    return res.render('employees/permissions', {
      title: isBn
        ? 'ব্যবহারকারী পারমিশন ও গ্যারেজ অ্যাক্সেস নিয়ন্ত্রণ - EGMS Portal'
        : 'User Permissions & Garage Access Control - EGMS Portal',
      activeNav: 'permissions',
      user,
      isSuperAdmin: true,
      employees,
      garages,
      stats,
      isBn,
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

      const targetEmp = await this.queryBus
        .execute(new GetEmployeeByIdQuery(id, user.companyId))
        .catch(() => null);
      const targetName =
        targetEmp?.name || body.employeeName || body.name || `Employee #${id}`;

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
        entityName: targetEmp?.name || body.employeeName || body.name || undefined,
        details: `Updated role & permissions for employee ${targetName}: role=${body.role || 'GENERAL'}, active=${isActive}, canCreate=${canCreate}, canEdit=${canEdit}, canDelete=${canDelete}`,
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
      const [employee, guarantors] = await Promise.all([
        this.queryBus.execute(new GetEmployeeByIdQuery(id, user.companyId)),
        this.queryBus.execute(new GetGuarantorsByEmployeeQuery(id, user.companyId)).catch(() => []),
      ]);
      return res.render('employees/details', {
        title: `${employee.name} - Employee Details`,
        activeNav: 'employees',
        user,
        isSuperAdmin: true,
        employee: { ...employee, guarantors },
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
  @UseInterceptors(AnyFilesInterceptor({ limits: { fileSize: 25 * 1024 * 1024 } }))
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

      let documentsToSet: any[] | undefined = undefined;
      const existingEmployee = await this.queryBus.execute(
        new GetEmployeeByIdQuery(id, user.companyId),
      );
      let existingDocs = existingEmployee?.documents ? [...existingEmployee.documents] : [];
      let docsModified = false;

      // Check if removeAvatar requested
      if (body.removeAvatar === 'true') {
        existingDocs = existingDocs.filter((d: any) => d.tag !== 'PHOTO' && d.tag !== 'AVATAR');
        docsModified = true;
      }

      // Process dedicated profile picture avatar upload (avatarFile)
      const avatarFile = (files || []).find((f: any) => f.fieldname === 'avatarFile' || f.fieldname === 'profilePicture');
      if (avatarFile && avatarFile.buffer && avatarFile.buffer.length > 0) {
        try {
          const uploadedPhoto = await this.fileService.uploadFile(
            avatarFile,
            'employees',
            'PHOTO',
            `${user.sub || user.companyId}|${user.role || 'SUPER_ADMIN'}`,
          );
          // Remove old photo doc and prepend new one
          existingDocs = existingDocs.filter((d: any) => d.tag !== 'PHOTO' && d.tag !== 'AVATAR');
          existingDocs.unshift(uploadedPhoto);
          docsModified = true;
        } catch (photoErr: any) {
          console.warn('Employee avatar update failed:', photoErr?.message);
        }
      }

      const regularFiles = (files || []).filter((f: any) => f.fieldname === 'files');
      if (regularFiles.length > 0) {
        const uploadedDocs = await this.fileService.uploadFiles(
          regularFiles,
          'employees',
          body.documentType || 'GENERAL',
        );
        existingDocs.push(...uploadedDocs);
        docsModified = true;
      }

      if (docsModified) {
        documentsToSet = existingDocs;
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
      const targetEmp = await this.queryBus
        .execute(new GetEmployeeByIdQuery(id, user.companyId))
        .catch(() => null);
      const targetName = targetEmp?.name || `Employee #${id}`;

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
        entityName: targetEmp?.name || undefined,
        details: `Deleted employee record for ${targetName}`,
        req,
      });

      return res.redirect('/employees?success=msg.employeeDeleted');
    } catch {
      return res.redirect('/employees?error=msg.genericError');
    }
  }

  // ==========================================
  // EMPLOYEE GUARANTOR SUB-RESOURCE ACTIONS
  // ==========================================

  // --- CREATE EMPLOYEE GUARANTOR ---
  @Post(':id/guarantors')
  @UseInterceptors(AnyFilesInterceptor({ limits: { fileSize: 25 * 1024 * 1024 } }))
  async handleCreateGuarantor(
    @Param('id') employeeId: string,
    @Body() dto: CreateGuarantorDto,
    @UploadedFiles() files: any[],
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const user = (req as any).user;

    try {
      const allFiles = files || [];
      const filesToUpload: any[] = [];
      const categories: string[] = [];

      // Categorized slots (guarantorDocFiles_0, guarantorDocFiles_1, ...)
      for (let s = 0; s < 15; s++) {
        const slotFiles = allFiles.filter((f: any) => f.fieldname === `guarantorDocFiles_${s}`);
        if (slotFiles.length > 0) {
          const slotCat = ((req.body as any)?.[`guarantorDocType_${s}`] || 'GENERAL').trim();
          for (const f of slotFiles) {
            filesToUpload.push(f);
            categories.push(slotCat);
          }
        }
      }

      // Legacy fallback (files)
      const legacyFiles = allFiles.filter((f: any) => f.fieldname === 'files');
      if (legacyFiles.length > 0) {
        const legacyCat = (dto.documentType || (req.body as any)?.documentType || (req.body as any)?.type || 'GENERAL').trim();
        for (const f of legacyFiles) {
          filesToUpload.push(f);
          categories.push(legacyCat);
        }
      }

      if (filesToUpload.length > 0) {
        const uploadedDocs = await this.fileService.uploadFiles(
          filesToUpload,
          'guarantors',
          categories,
          user.name || user.email,
        );
        dto.documents = uploadedDocs;
      }

      await this.commandBus.execute(
        new CreateEmployeeGuarantorCommand(
          user.companyId,
          employeeId,
          dto,
          `${user.sub || user.companyId}|${user.role || 'SUPER_ADMIN'}`,
        ),
      );

      await this.auditLogService.record({
        companyId: user.companyId,
        userId: user.sub || user.companyId,
        userName: user.name,
        userRole: user.role,
        action: 'EMPLOYEE_GUARANTOR_CREATED',
        entityType: 'EMPLOYEE_GUARANTOR',
        entityId: employeeId,
        entityName: dto.name,
        details: `Added guarantor ${dto.name} (${dto.relationship || 'N/A'}) to employee #${employeeId}`,
        req,
      });

      return res.redirect(`/employees/${employeeId}?success=msg.guarantorAdded`);
    } catch (err: any) {
      return res.redirect(
        `/employees/${employeeId}?error=${encodeURIComponent(err.message || 'Failed to add guarantor')}`,
      );
    }
  }

  // --- RENDER EDIT EMPLOYEE GUARANTOR FORM ---
  @Get(':id/guarantors/:guarantorId/edit')
  async renderEditGuarantorForm(
    @Param('id') employeeId: string,
    @Param('guarantorId') guarantorId: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const user = (req as any).user;

    try {
      const employee = await this.queryBus.execute(
        new GetEmployeeByIdQuery(employeeId, user.companyId),
      );

      const guarantors = await this.queryBus.execute(
        new GetGuarantorsByEmployeeQuery(employeeId, user.companyId),
      );
      const guarantor = guarantors.find((g: any) => g.id === guarantorId);
      if (!guarantor) {
        return res.redirect(`/employees/${employeeId}?error=Guarantor+not+found`);
      }

      return res.render('employees/edit-guarantor', {
        title: `Edit Guarantor: ${guarantor.name} - EGMS Portal`,
        activeNav: 'employees',
        user,
        isSuperAdmin: true,
        employee,
        guarantor,
      });
    } catch {
      return res.redirect(`/employees/${employeeId}`);
    }
  }

  // --- UPDATE EMPLOYEE GUARANTOR ---
  @Post(':id/guarantors/:guarantorId')
  @UseInterceptors(AnyFilesInterceptor({ limits: { fileSize: 25 * 1024 * 1024 } }))
  async handleUpdateGuarantor(
    @Param('id') employeeId: string,
    @Param('guarantorId') guarantorId: string,
    @Body() dto: UpdateGuarantorDto,
    @UploadedFiles() files: any[],
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const user = (req as any).user;

    try {
      const allFiles = files || [];
      const filesToUpload: any[] = [];
      const categories: string[] = [];

      // Categorized slots (guarantorDocFiles_0, guarantorDocFiles_1, ...)
      for (let s = 0; s < 15; s++) {
        const slotFiles = allFiles.filter((f: any) => f.fieldname === `guarantorDocFiles_${s}`);
        if (slotFiles.length > 0) {
          const slotCat = ((req.body as any)?.[`guarantorDocType_${s}`] || 'GENERAL').trim();
          for (const f of slotFiles) {
            filesToUpload.push(f);
            categories.push(slotCat);
          }
        }
      }

      // Legacy fallback (files)
      const legacyFiles = allFiles.filter((f: any) => f.fieldname === 'files');
      if (legacyFiles.length > 0) {
        const legacyCat = ((dto as any).documentType || (req.body as any)?.documentType || 'GENERAL').trim();
        for (const f of legacyFiles) {
          filesToUpload.push(f);
          categories.push(legacyCat);
        }
      }

      if (filesToUpload.length > 0) {
        const uploadedDocs = await this.fileService.uploadFiles(
          filesToUpload,
          'guarantors',
          categories,
          user.name || user.email,
        );
        const guarantors = await this.queryBus.execute(
          new GetGuarantorsByEmployeeQuery(employeeId, user.companyId),
        );
        const currentGuarantor = guarantors.find((g: any) => g.id === guarantorId);
        const existingDocs = currentGuarantor?.documents || [];
        dto.documents = [...existingDocs, ...uploadedDocs];
      }

      await this.commandBus.execute(
        new UpdateEmployeeGuarantorCommand(
          user.companyId,
          employeeId,
          guarantorId,
          dto,
          `${user.sub || user.companyId}|${user.role || 'SUPER_ADMIN'}`,
        ),
      );

      await this.auditLogService.record({
        companyId: user.companyId,
        userId: user.sub || user.companyId,
        userName: user.name,
        userRole: user.role,
        action: 'EMPLOYEE_GUARANTOR_UPDATED',
        entityType: 'EMPLOYEE_GUARANTOR',
        entityId: guarantorId,
        entityName: dto.name,
        details: `Updated guarantor ${dto.name} for employee #${employeeId}`,
        req,
      });

      return res.redirect(`/employees/${employeeId}?success=msg.guarantorUpdated`);
    } catch (err: any) {
      return res.render('employees/edit-guarantor', {
        title: `Edit Guarantor - EGMS Portal`,
        activeNav: 'employees',
        user,
        isSuperAdmin: true,
        employee: { id: employeeId },
        guarantor: { id: guarantorId, ...dto },
        error: err.message || 'Failed to update guarantor',
      });
    }
  }

  // --- DELETE EMPLOYEE GUARANTOR ---
  @Post(':id/guarantors/:guarantorId/delete')
  async handleDeleteGuarantor(
    @Param('id') employeeId: string,
    @Param('guarantorId') guarantorId: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const user = (req as any).user;

    try {
      await this.commandBus.execute(
        new DeleteEmployeeGuarantorCommand(
          user.companyId,
          employeeId,
          guarantorId,
          `${user.sub || user.companyId}|${user.role || 'SUPER_ADMIN'}`,
        ),
      );

      await this.auditLogService.record({
        companyId: user.companyId,
        userId: user.sub || user.companyId,
        userName: user.name,
        userRole: user.role,
        action: 'EMPLOYEE_GUARANTOR_DELETED',
        entityType: 'EMPLOYEE_GUARANTOR',
        entityId: guarantorId,
        details: `Removed guarantor #${guarantorId} from employee #${employeeId}`,
        req,
      });

      return res.redirect(`/employees/${employeeId}?success=msg.guarantorRemoved`);
    } catch (err: any) {
      return res.redirect(
        `/employees/${employeeId}?error=${encodeURIComponent(err.message || 'Failed to delete guarantor')}`,
      );
    }
  }
}
