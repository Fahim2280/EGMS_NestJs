import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  Query,
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
import {
  CreateCustomerDto,
  UpdateCustomerDto,
} from '@application/dtos/customer.dto';
import {
  CreateGuarantorDto,
  UpdateGuarantorDto,
} from '@application/dtos/guarantor.dto';
import { CreateCustomerCommand } from '@application/commands/impl/create-customer.command';
import { UpdateCustomerCommand } from '@application/commands/impl/update-customer.command';
import { DeleteCustomerCommand } from '@application/commands/impl/delete-customer.command';
import { ToggleCustomerStatusCommand } from '@application/commands/impl/toggle-customer-status.command';
import { CreateGuarantorCommand } from '@application/commands/impl/create-guarantor.command';
import { UpdateGuarantorCommand } from '@application/commands/impl/update-guarantor.command';
import { DeleteGuarantorCommand } from '@application/commands/impl/delete-guarantor.command';
import { GetCustomersByCompanyQuery } from '@application/queries/impl/get-customers-by-company.query';
import { GetCustomerByIdQuery } from '@application/queries/impl/get-customer-by-id.query';
import { GetGaragesByCompanyQuery } from '@application/queries/impl/get-garages-by-company.query';
import { GetGuarantorsByCustomerQuery } from '@application/queries/impl/get-guarantors-by-customer.query';
import { JwtAuthGuard } from '@infrastructure/auth/jwt-auth.guard';
import { PermissionsGuard } from '@infrastructure/auth/permissions.guard';
import { RequirePermissions } from '@infrastructure/auth/permissions.decorator';
import { AuditLogService } from '@application/services/audit-log.service';
import {
  GUARANTOR_REPOSITORY_TOKEN,
  IGuarantorRepository,
} from '@domain/index';

@Controller('customers')
@UseGuards(JwtAuthGuard)
export class CustomerController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly auditLogService: AuditLogService,
    private readonly fileService: FileService,
    @Inject(GUARANTOR_REPOSITORY_TOKEN)
    private readonly guarantorRepo: IGuarantorRepository,
  ) {}

  // --- VIEW: List customers ---
  @Get()
  async listCustomers(
    @Req() req: Request,
    @Res() res: Response,
    @Query('search') search?: string,
    @Query('garageId') garageId?: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
    @Query('preset') preset?: string,
    @Query('page') page?: string,
  ) {
    const user = (req as any).user;
    const isSuperAdmin = user.role === 'SUPER_ADMIN' || user.isSuperAdmin;
    const allowedGarageIds = isSuperAdmin ? null : (user.garageIds || []);

    const currentPage = Math.max(1, parseInt(page || '1', 10));
    const pageSize = 15;

    let customers = await this.queryBus.execute(
      new GetCustomersByCompanyQuery(user.companyId, allowedGarageIds),
    );

    const garages = await this.queryBus.execute(
      new GetGaragesByCompanyQuery(user.companyId, allowedGarageIds),
    );

    // Filter by garage if selected
    if (garageId && garageId.trim()) {
      customers = customers.filter((c: any) => c.garageId === garageId.trim());
    }

    // Filter by registration date range
    if (fromDate) {
      const fromTime = new Date(fromDate).setHours(0, 0, 0, 0);
      customers = customers.filter(
        (c: any) => c.createdDate && new Date(c.createdDate).getTime() >= fromTime,
      );
    }
    if (toDate) {
      const toTime = new Date(toDate).setHours(23, 59, 59, 999);
      customers = customers.filter(
        (c: any) => c.createdDate && new Date(c.createdDate).getTime() <= toTime,
      );
    }

    // Client-side search filter
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      customers = customers.filter(
        (c: any) =>
          c.name.toLowerCase().includes(q) ||
          c.mobileNumber?.includes(q) ||
          c.nidNumber?.includes(q) ||
          c.address?.toLowerCase().includes(q) ||
          c.garageName?.toLowerCase().includes(q) ||
          c.customerCode?.toLowerCase().includes(q),
      );
    }

    const totalCount = customers.length;
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
    const safePage = Math.min(currentPage, totalPages);
    const paginated = customers.slice((safePage - 1) * pageSize, safePage * pageSize);

    return res.render('customers/index', {
      title: 'Customer Directory - EGMS Portal',
      activeNav: 'customers',
      user,
      isSuperAdmin,
      canCreate: isSuperAdmin || Boolean(user.canCreate),
      canEdit: isSuperAdmin || Boolean(user.canEdit),
      canDelete: isSuperAdmin || Boolean(user.canDelete),
      canView: isSuperAdmin || Boolean(user.canView),
      customers: paginated,
      customerCount: totalCount,
      garages,
      selectedGarageId: garageId || '',
      search: search || '',
      fromDate: fromDate || '',
      toDate: toDate || '',
      preset: preset || '',
      pagination: {
        page: safePage,
        totalPages,
        totalCount,
        hasNext: safePage < totalPages,
        hasPrev: safePage > 1,
      },
    });
  }

  // --- CREATE ---
  @Get('new')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('canCreate')
  async renderCreateForm(
    @Req() req: Request,
    @Res() res: Response,
    @Query('garageId') garageId?: string,
  ) {
    const user = (req as any).user;
    const isSuperAdmin = user.role === 'SUPER_ADMIN' || user.isSuperAdmin;
    const allowedGarageIds = isSuperAdmin ? null : (user.garageIds || []);

    const garages = await this.queryBus.execute(
      new GetGaragesByCompanyQuery(user.companyId, allowedGarageIds),
    );
    const customerCount = await this.queryBus.execute(
      new GetCustomersByCompanyQuery(user.companyId, null),
    );
    const nextNum = String((Array.isArray(customerCount) ? customerCount.length : 0) + 1).padStart(3, '0');

    let isGarageSuspended = false;
    let errorMsg: string | undefined = undefined;
    if (garageId) {
      const selectedGarage = (garages || []).find((g: any) => g.id === garageId);
      if (selectedGarage && selectedGarage.isActive === false) {
        isGarageSuspended = true;
        errorMsg = 'msg.garageSuspendedCustomerBlocked';
      }
    }

    return res.render('customers/create', {
      title: 'Register New Customer - EGMS Portal',
      activeNav: 'customers',
      user,
      garages,
      selectedGarageId: garageId || '',
      isGarageSuspended,
      error: errorMsg,
      nextCustomerCode: `CUST-${nextNum}`,
    });
  }

  @Post()
  @UseGuards(PermissionsGuard)
  @RequirePermissions('canCreate')
  @UseInterceptors(AnyFilesInterceptor({ limits: { fileSize: 25 * 1024 * 1024 } }))
  async handleCreate(
    @Body() dto: CreateCustomerDto,
    @UploadedFiles() files: any[],
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const user = (req as any).user;
    const isSuperAdmin = user.role === 'SUPER_ADMIN' || user.isSuperAdmin;
    const allowedGarageIds = isSuperAdmin ? null : (user.garageIds || []);

    // Validate garage access
    if (!isSuperAdmin && dto.garageId && !user.garageIds?.includes(dto.garageId)) {
      const garages = await this.queryBus.execute(
        new GetGaragesByCompanyQuery(user.companyId, allowedGarageIds),
      );
      return res.render('customers/create', {
        title: 'Register New Customer - EGMS Portal',
        activeNav: 'customers',
        user,
        garages,
        selectedGarageId: dto.garageId || '',
        error: 'You do not have permission to register a customer in this garage.',
        formData: dto,
      });
    }

    // Validate garage active status immediately
    if (dto.garageId) {
      const garages = await this.queryBus.execute(
        new GetGaragesByCompanyQuery(user.companyId, allowedGarageIds),
      );
      const targetGarage = (garages || []).find((g: any) => g.id === dto.garageId);
      if (targetGarage && targetGarage.isActive === false) {
        return res.render('customers/create', {
          title: 'Register New Customer - EGMS Portal',
          activeNav: 'customers',
          user,
          garages,
          selectedGarageId: dto.garageId || '',
          isGarageSuspended: true,
          error: 'msg.garageSuspendedCustomerBlocked',
          formData: dto,
        });
      }
    }

    try {
      // Process multi-category document slots (customerDocFiles_0, customerDocFiles_1, ...) + legacy 'files'
      const customerUploadedDocs: any[] = [];
      const MAX_DOC_SLOTS = 15;
      for (let i = 0; i < MAX_DOC_SLOTS; i++) {
        const slotFieldName = `customerDocFiles_${i}`;
        const slotFiles = (files || []).filter((f: any) => f.fieldname === slotFieldName);
        if (slotFiles.length > 0) {
          const rawTag = (dto as any)[`customerDocType_${i}`] || (req.body && req.body[`customerDocType_${i}`]) || 'GENERAL';
          const tags = slotFiles.map(() => rawTag);
          const uploaded = await this.fileService.uploadFiles(
            slotFiles,
            'customers',
            tags,
            `${user.sub || user.companyId}|${user.role || 'SUPER_ADMIN'}`,
          );
          customerUploadedDocs.push(...uploaded);
        }
      }

      // Legacy fallback: single 'files' field upload
      const legacyCustomerFiles = (files || []).filter((f: any) => f.fieldname === 'files');
      if (legacyCustomerFiles.length > 0) {
        const uploadedDocs = await this.fileService.uploadFiles(
          legacyCustomerFiles,
          'customers',
          (dto as any).documentType || 'GENERAL',
          `${user.sub || user.companyId}|${user.role || 'SUPER_ADMIN'}`,
        );
        customerUploadedDocs.push(...uploadedDocs);
      }

      // Process dedicated profile picture avatar upload (avatarFile)
      const avatarFile = (files || []).find((f: any) => f.fieldname === 'avatarFile' || f.fieldname === 'profilePicture');
      if (avatarFile && avatarFile.buffer && avatarFile.buffer.length > 0) {
        try {
          const uploadedPhoto = await this.fileService.uploadFile(
            avatarFile,
            'customers',
            'PHOTO',
            `${user.sub || user.companyId}|${user.role || 'SUPER_ADMIN'}`,
          );
          customerUploadedDocs.unshift(uploadedPhoto);
        } catch (photoErr: any) {
          console.warn('Customer avatar upload failed:', photoErr?.message);
        }
      }

      if (customerUploadedDocs.length > 0) {
        dto.documents = customerUploadedDocs;
      }

      const customer = await this.commandBus.execute(
        new CreateCustomerCommand(
          user.companyId,
          dto,
          `${user.sub || user.companyId}|${user.role || 'SUPER_ADMIN'}`,
        ),
      );

      // Create initial guarantor(s) if provided on the registration form
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
            new CreateGuarantorCommand(
              user.companyId,
              customer.id,
              gDto,
              `${user.sub || user.companyId}|${user.role || 'SUPER_ADMIN'}`,
            ),
          );
          createdGuarantors.push({ index: gi, guarantor });
        } catch (gErr: any) {
          console.warn(`Failed to create initial guarantor for customer ${customer.id}:`, gErr?.message);
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
        entityType: 'CUSTOMER',
        entityName: dto.name,
        details: `Registered customer ${dto.name} (${dto.customerCode || 'auto-ID'}) with advance ৳${dto.advanceMoney}${guarantorsToCreate.length > 0 ? ` and ${guarantorsToCreate.length} guarantor(s)` : ''}`,
        req,
      });

      return res.redirect('/customers?success=msg.customerCreated');
    } catch (err: any) {
      const garages = await this.queryBus.execute(
        new GetGaragesByCompanyQuery(user.companyId, allowedGarageIds),
      );
      return res.render('customers/create', {
        title: 'Register New Customer - EGMS Portal',
        activeNav: 'customers',
        user,
        garages,
        selectedGarageId: dto.garageId || '',
        isGarageSuspended: err.message === 'msg.garageSuspendedCustomerBlocked',
        error: err.message || 'Failed to create customer.',
        formData: dto,
      });
    }
  }

  // --- CHECK CUSTOMER CODE AVAILABILITY ---
  @Get('check-code')
  async checkCustomerCode(
    @Req() req: Request,
    @Res() res: Response,
    @Query('code') code?: string,
    @Query('exclude') exclude?: string,
  ) {
    const user = (req as any).user;
    if (!code || !code.trim()) {
      return res.json({ available: true });
    }
    const existing = await (this.queryBus as any).execute(
      new GetCustomersByCompanyQuery(user.companyId, null),
    );
    const taken = existing.some(
      (c: any) =>
        c.customerCode &&
        c.customerCode.toLowerCase() === code.trim().toLowerCase() &&
        c.id !== exclude,
    );
    return res.json({ available: !taken });
  }

  // --- VIEW DETAILS ---
  @Get(':id')
  async renderDetails(
    @Param('id') id: string,
    @Req() req: Request,
    @Res() res: Response,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
    @Query('preset') preset?: string,
  ) {
    const user = (req as any).user;
    const isSuperAdmin = user.role === 'SUPER_ADMIN' || user.isSuperAdmin;

    try {
      const customer = await this.queryBus.execute(
        new GetCustomerByIdQuery(id, user.companyId),
      );

      // Verify garage permission
      if (!isSuperAdmin && customer.garageId && !user.garageIds?.includes(customer.garageId)) {
        return res.redirect('/customers?error=You+do+not+have+permission+to+view+this+customer');
      }

      let bills = customer.bills || [];
      const totalAllBillsCount = bills.length;

      let effectiveFromDate = fromDate;
      let effectiveToDate = toDate;

      // Handle preset calculation when direct dates are not supplied
      if (preset && !fromDate && !toDate) {
        const now = new Date();
        const pad = (n: number) => String(n).padStart(2, '0');
        const fmt = (d: Date) =>
          `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
        const todayStr = fmt(now);

        switch (preset) {
          case 'today':
            effectiveFromDate = todayStr;
            effectiveToDate = todayStr;
            break;
          case 'thisMonth':
            effectiveFromDate = fmt(new Date(now.getFullYear(), now.getMonth(), 1));
            effectiveToDate = todayStr;
            break;
          case 'lastMonth': {
            const lm = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            effectiveFromDate = fmt(lm);
            effectiveToDate = fmt(new Date(now.getFullYear(), now.getMonth(), 0));
            break;
          }
          case 'last30': {
            const d = new Date(now);
            d.setDate(d.getDate() - 30);
            effectiveFromDate = fmt(d);
            effectiveToDate = todayStr;
            break;
          }
          case 'thisYear':
            effectiveFromDate = `${now.getFullYear()}-01-01`;
            effectiveToDate = todayStr;
            break;
        }
      }

      // Find true latest bill ID across all customer bills (regardless of active date filter)
      const sortedAllBills = [...(customer.bills || [])].sort(
        (a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      const actualLatestBillId = sortedAllBills.length > 0 ? sortedAllBills[0].id : null;

      // Filter customer bills by date range
      if (effectiveFromDate) {
        const fromTime = new Date(`${effectiveFromDate}T00:00:00`).getTime();
        bills = bills.filter((b: any) => new Date(b.date).getTime() >= fromTime);
      }
      if (effectiveToDate) {
        const toTime = new Date(`${effectiveToDate}T23:59:59.999`).getTime();
        bills = bills.filter((b: any) => new Date(b.date).getTime() <= toTime);
      }

      // Sort descending
      bills.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
      bills = bills.map((b: any) => ({
        ...b,
        isLatestBill: b.id === actualLatestBillId,
      }));

      let periodUnits = 0;
      let periodBilled = 0;
      let periodPaid = 0;
      for (const b of bills) {
        periodUnits += b.totalUnit || 0;
        periodBilled += b.totalBill || 0;
        periodPaid += b.clearMoney || 0;
      }

      return res.render('customers/details', {
        title: `Customer: ${customer.name} - EGMS Portal`,
        activeNav: 'customers',
        user,
        isSuperAdmin,
        canCreate: isSuperAdmin || Boolean(user.canCreate),
        canEdit: isSuperAdmin || Boolean(user.canEdit),
        canDelete: isSuperAdmin || Boolean(user.canDelete),
        customer,
        bills,
        totalBillsCount: totalAllBillsCount,
        totalFilteredBillsCount: bills.length,
        periodSummary: {
          units: periodUnits,
          billed: periodBilled,
          paid: periodPaid,
        },
        fromDate: effectiveFromDate || '',
        toDate: effectiveToDate || '',
        preset: preset || '',
      });
    } catch {
      return res.redirect('/customers');
    }
  }

  // --- EDIT ---
  @Get(':id/edit')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('canEdit')
  async renderEditForm(
    @Param('id') id: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const user = (req as any).user;
    const isSuperAdmin = user.role === 'SUPER_ADMIN' || user.isSuperAdmin;
    const allowedGarageIds = isSuperAdmin ? null : (user.garageIds || []);

    try {
      const customer = await this.queryBus.execute(
        new GetCustomerByIdQuery(id, user.companyId),
      );

      if (!isSuperAdmin && customer.garageId && !user.garageIds?.includes(customer.garageId)) {
        return res.redirect('/customers?error=You+do+not+have+permission+to+edit+this+customer');
      }

      const garages = await this.queryBus.execute(
        new GetGaragesByCompanyQuery(user.companyId, allowedGarageIds),
      );
      return res.render('customers/edit', {
        title: `Edit Customer: ${customer.name} - EGMS Portal`,
        activeNav: 'customers',
        user,
        customer,
        garages,
        selectedGarageId: customer.garageId || '',
      });
    } catch {
      return res.redirect('/customers');
    }
  }

  @Post(':id/edit')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('canEdit')
  @UseInterceptors(AnyFilesInterceptor({ limits: { fileSize: 25 * 1024 * 1024 } }))
  async handleUpdate(
    @Param('id') id: string,
    @Body() dto: UpdateCustomerDto,
    @UploadedFiles() files: any[],
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const user = (req as any).user;
    const isSuperAdmin = user.role === 'SUPER_ADMIN' || user.isSuperAdmin;
    const allowedGarageIds = isSuperAdmin ? null : (user.garageIds || []);

    try {
      const existing = await this.queryBus.execute(
        new GetCustomerByIdQuery(id, user.companyId),
      );

      if (!isSuperAdmin && existing.garageId && !user.garageIds?.includes(existing.garageId)) {
        return res.redirect('/customers?error=You+do+not+have+permission+to+edit+this+customer');
      }

      let existingDocs = existing.documents ? [...existing.documents] : [];

      // Check if removeAvatar requested
      if ((dto as any).removeAvatar === 'true' || (req.body && req.body.removeAvatar === 'true')) {
        existingDocs = existingDocs.filter((d: any) => d.tag !== 'PHOTO' && d.tag !== 'AVATAR');
      }

      // Process dedicated profile picture avatar upload (avatarFile)
      const avatarFile = (files || []).find((f: any) => f.fieldname === 'avatarFile' || f.fieldname === 'profilePicture');
      if (avatarFile && avatarFile.buffer && avatarFile.buffer.length > 0) {
        try {
          const uploadedPhoto = await this.fileService.uploadFile(
            avatarFile,
            'customers',
            'PHOTO',
            `${user.sub || user.companyId}|${user.role || 'SUPER_ADMIN'}`,
          );
          // Remove old photo doc and prepend new one
          existingDocs = existingDocs.filter((d: any) => d.tag !== 'PHOTO' && d.tag !== 'AVATAR');
          existingDocs.unshift(uploadedPhoto);
        } catch (photoErr: any) {
          console.warn('Customer avatar update failed:', photoErr?.message);
        }
      }

      const regularFiles = (files || []).filter((f: any) => f.fieldname === 'files');
      if (regularFiles.length > 0) {
        const uploadedDocs = await this.fileService.uploadFiles(
          regularFiles,
          'customers',
          (dto as any).documentType || 'GENERAL',
        );
        existingDocs.push(...uploadedDocs);
      }

      dto.documents = existingDocs;

      await this.commandBus.execute(
        new UpdateCustomerCommand(
          id,
          user.companyId,
          dto,
          `${user.sub || user.companyId}|${user.role || 'SUPER_ADMIN'}`,
        ),
      );

      await this.auditLogService.record({
        companyId: user.companyId,
        userId: user.sub || user.companyId,
        userName: user.name,
        userRole: user.role,
        action: 'UPDATE',
        entityType: 'CUSTOMER',
        entityId: id,
        entityName: dto.name,
        details: `Updated customer profile ${dto.name} (${dto.customerCode || id})`,
        req,
      });

      return res.redirect(`/customers/${id}?success=msg.customerUpdated`);
    } catch (err: any) {
      const garages = await this.queryBus.execute(
        new GetGaragesByCompanyQuery(user.companyId, allowedGarageIds),
      );
      return res.render('customers/edit', {
        title: 'Edit Customer - EGMS Portal',
        activeNav: 'customers',
        user,
        customer: { id, ...dto },
        garages,
        selectedGarageId: dto.garageId || '',
        error: err.message || 'Failed to update customer.',
      });
    }
  }

  // --- DELETE ---
  @Post(':id/delete')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('canDelete')
  async handleDelete(
    @Param('id') id: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const user = (req as any).user;
    const isSuperAdmin = user.role === 'SUPER_ADMIN' || user.isSuperAdmin;

    try {
      const existing = await this.queryBus.execute(
        new GetCustomerByIdQuery(id, user.companyId),
      );

      if (!isSuperAdmin && existing.garageId && !user.garageIds?.includes(existing.garageId)) {
        return res.redirect('/customers?error=You+do+not+have+permission+to+delete+this+customer');
      }

      await this.commandBus.execute(
        new DeleteCustomerCommand(
          id,
          user.companyId,
          `${user.sub || user.companyId}|${user.role || 'SUPER_ADMIN'}`,
        ),
      );

      await this.auditLogService.record({
        companyId: user.companyId,
        userId: user.sub || user.companyId,
        userName: user.name,
        userRole: user.role,
        action: 'DELETE',
        entityType: 'CUSTOMER',
        entityId: id,
        entityName: existing?.name || id,
        details: `Deleted customer record ${existing?.name || id}`,
        req,
      });
      return res.redirect('/customers?success=msg.customerDeleted');
    } catch {
      return res.redirect('/customers?error=msg.customerDeleteFailed');
    }
  }

  // --- TOGGLE STATUS (SUSPEND / REACTIVATE) ---
  @Post(':id/toggle-status')
  async handleToggleStatus(
    @Param('id') id: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const user = (req as any).user;
    const isSuperAdmin = user.role === 'SUPER_ADMIN' || user.isSuperAdmin;

    if (!isSuperAdmin) {
      const returnUrl = req.headers.referer || `/customers/${id}`;
      return res.redirect(`${returnUrl}${returnUrl.includes('?') ? '&' : '?'}error=msg.superAdminRequired`);
    }

    try {
      const result = await this.commandBus.execute(
        new ToggleCustomerStatusCommand(
          id,
          user.companyId,
          `${user.sub || user.companyId}|${user.role || 'SUPER_ADMIN'}`,
        ),
      );

      const customer = result.customer;
      const isSuspended = !result.isActive;

      await this.auditLogService.record({
        companyId: user.companyId,
        userId: user.sub || user.companyId,
        userName: user.name,
        userRole: user.role,
        action: 'UPDATE',
        entityType: 'CUSTOMER',
        entityId: id,
        entityName: customer.name,
        details: isSuspended
          ? `Suspended customer account ${customer.name} (${customer.customerCode || customer.id})`
          : `Reactivated customer account ${customer.name} (${customer.customerCode || customer.id})`,
        req,
      });

      const referer = req.headers.referer || '';
      let returnUrl = `/customers/${id}`;
      if (referer) {
        try {
          const urlObj = new URL(referer);
          // Preserve query parameters except error/success
          urlObj.searchParams.delete('error');
          urlObj.searchParams.delete('success');
          returnUrl = urlObj.pathname + (urlObj.searchParams.toString() ? `?${urlObj.searchParams.toString()}` : '');
        } catch {
          returnUrl = referer.split('?')[0];
        }
      }

      const msgKey = isSuspended ? 'msg.customerSuspended' : 'msg.customerReactivated';
      const separator = returnUrl.includes('?') ? '&' : '?';
      return res.redirect(`${returnUrl}${separator}success=${msgKey}`);
    } catch (err: any) {
      const returnUrl = req.headers.referer || `/customers/${id}`;
      const separator = returnUrl.includes('?') ? '&' : '?';
      return res.redirect(`${returnUrl}${separator}error=${encodeURIComponent(err.message || 'Operation failed')}`);
    }
  }

  // ==========================================
  // GUARANTOR SUB-RESOURCE ACTIONS
  // ==========================================

  // --- CREATE GUARANTOR ---
  @Post(':id/guarantors')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('canCreate')
  @UseInterceptors(AnyFilesInterceptor({ limits: { fileSize: 25 * 1024 * 1024 } }))
  async handleCreateGuarantor(
    @Param('id') customerId: string,
    @Body() dto: CreateGuarantorDto,
    @UploadedFiles() files: any[],
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const user = (req as any).user;
    const isSuperAdmin = user.role === 'SUPER_ADMIN' || user.isSuperAdmin;

    try {
      const customer = await this.queryBus.execute(
        new GetCustomerByIdQuery(customerId, user.companyId),
      );

      if (!isSuperAdmin && customer.garageId && !user.garageIds?.includes(customer.garageId)) {
        return res.redirect(`/customers/${customerId}?error=You+do+not+have+permission+to+manage+this+customer`);
      }

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
        new CreateGuarantorCommand(
          user.companyId,
          customerId,
          dto,
          `${user.sub || user.companyId}|${user.role || 'SUPER_ADMIN'}`,
        ),
      );

      return res.redirect(`/customers/${customerId}?success=msg.guarantorAdded`);
    } catch (err: any) {
      return res.redirect(
        `/customers/${customerId}?error=${encodeURIComponent(err.message || 'Failed to add guarantor')}`,
      );
    }
  }

  // --- RENDER EDIT GUARANTOR FORM ---
  @Get(':id/guarantors/:guarantorId/edit')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('canEdit')
  async renderEditGuarantorForm(
    @Param('id') customerId: string,
    @Param('guarantorId') guarantorId: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const user = (req as any).user;
    const isSuperAdmin = user.role === 'SUPER_ADMIN' || user.isSuperAdmin;

    try {
      const customer = await this.queryBus.execute(
        new GetCustomerByIdQuery(customerId, user.companyId),
      );

      if (!isSuperAdmin && customer.garageId && !user.garageIds?.includes(customer.garageId)) {
        return res.redirect('/customers?error=You+do+not+have+permission+to+edit+this+guarantor');
      }

      const guarantors = await this.queryBus.execute(
        new GetGuarantorsByCustomerQuery(customerId, user.companyId),
      );
      const guarantor = guarantors.find((g: any) => g.id === guarantorId);
      if (!guarantor) {
        return res.redirect(`/customers/${customerId}?error=Guarantor+not+found`);
      }

      return res.render('customers/edit-guarantor', {
        title: `Edit Guarantor: ${guarantor.name} - EGMS Portal`,
        activeNav: 'customers',
        user,
        isSuperAdmin,
        customer,
        guarantor,
      });
    } catch {
      return res.redirect(`/customers/${customerId}`);
    }
  }

  // --- UPDATE GUARANTOR ---
  @Post(':id/guarantors/:guarantorId')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('canEdit')
  @UseInterceptors(AnyFilesInterceptor({ limits: { fileSize: 25 * 1024 * 1024 } }))
  async handleUpdateGuarantor(
    @Param('id') customerId: string,
    @Param('guarantorId') guarantorId: string,
    @Body() dto: UpdateGuarantorDto,
    @UploadedFiles() files: any[],
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const user = (req as any).user;
    const isSuperAdmin = user.role === 'SUPER_ADMIN' || user.isSuperAdmin;

    try {
      const customer = await this.queryBus.execute(
        new GetCustomerByIdQuery(customerId, user.companyId),
      );

      if (!isSuperAdmin && customer.garageId && !user.garageIds?.includes(customer.garageId)) {
        return res.redirect(`/customers/${customerId}?error=You+do+not+have+permission+to+edit+this+guarantor`);
      }

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
          new GetGuarantorsByCustomerQuery(customerId, user.companyId),
        );
        const currentGuarantor = guarantors.find((g: any) => g.id === guarantorId);
        const existingDocs = currentGuarantor?.documents || [];
        dto.documents = [...existingDocs, ...uploadedDocs];
      }

      await this.commandBus.execute(
        new UpdateGuarantorCommand(
          user.companyId,
          customerId,
          guarantorId,
          dto,
          `${user.sub || user.companyId}|${user.role || 'SUPER_ADMIN'}`,
        ),
      );

      return res.redirect(`/customers/${customerId}?success=msg.guarantorUpdated`);
    } catch (err: any) {
      return res.render('customers/edit-guarantor', {
        title: `Edit Guarantor - EGMS Portal`,
        activeNav: 'customers',
        user,
        isSuperAdmin,
        customer: { id: customerId },
        guarantor: { id: guarantorId, ...dto },
        error: err.message || 'Failed to update guarantor',
      });
    }
  }

  // --- DELETE GUARANTOR ---
  @Post(':id/guarantors/:guarantorId/delete')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('canDelete')
  async handleDeleteGuarantor(
    @Param('id') customerId: string,
    @Param('guarantorId') guarantorId: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const user = (req as any).user;
    const isSuperAdmin = user.role === 'SUPER_ADMIN' || user.isSuperAdmin;

    try {
      const customer = await this.queryBus.execute(
        new GetCustomerByIdQuery(customerId, user.companyId),
      );

      if (!isSuperAdmin && customer.garageId && !user.garageIds?.includes(customer.garageId)) {
        return res.redirect(`/customers/${customerId}?error=You+do+not+have+permission+to+delete+this+guarantor`);
      }

      await this.commandBus.execute(
        new DeleteGuarantorCommand(
          user.companyId,
          customerId,
          guarantorId,
          `${user.sub || user.companyId}|${user.role || 'SUPER_ADMIN'}`,
        ),
      );

      return res.redirect(`/customers/${customerId}?success=msg.guarantorDeleted`);
    } catch (err: any) {
      return res.redirect(
        `/customers/${customerId}?error=${encodeURIComponent(err.message || 'Failed to delete guarantor')}`,
      );
    }
  }
}
