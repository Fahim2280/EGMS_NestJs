import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
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

@Controller('customers')
@UseGuards(JwtAuthGuard)
export class CustomerController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly auditLogService: AuditLogService,
    private readonly fileService: FileService,
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
    return res.render('customers/create', {
      title: 'Register New Customer - EGMS Portal',
      activeNav: 'customers',
      user,
      garages,
      selectedGarageId: garageId || '',
      nextCustomerCode: `CUST-${nextNum}`,
    });
  }

  @Post()
  @UseGuards(PermissionsGuard)
  @RequirePermissions('canCreate')
  @UseInterceptors(FilesInterceptor('files', 10, { limits: { fileSize: 25 * 1024 * 1024 } }))
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

    try {
      if (files && files.length > 0) {
        const uploadedDocs = await this.fileService.uploadFiles(
          files,
          'customers',
          (dto as any).documentType || 'GENERAL',
        );
        dto.documents = uploadedDocs;
      }

      await this.commandBus.execute(
        new CreateCustomerCommand(
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
        action: 'CREATE',
        entityType: 'CUSTOMER',
        entityName: dto.name,
        details: `Registered customer ${dto.name} (${dto.customerCode || 'auto-ID'}) with advance ৳${dto.advanceMoney}`,
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

      // Filter customer bills by date range
      if (fromDate) {
        const fromTime = new Date(fromDate).setHours(0, 0, 0, 0);
        bills = bills.filter((b: any) => new Date(b.date).getTime() >= fromTime);
      }
      if (toDate) {
        const toTime = new Date(toDate).setHours(23, 59, 59, 999);
        bills = bills.filter((b: any) => new Date(b.date).getTime() <= toTime);
      }

      // Sort descending
      bills.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

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
        totalBillsCount: bills.length,
        periodSummary: {
          units: periodUnits,
          billed: periodBilled,
          paid: periodPaid,
        },
        fromDate: fromDate || '',
        toDate: toDate || '',
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
  @UseInterceptors(FilesInterceptor('files', 10, { limits: { fileSize: 25 * 1024 * 1024 } }))
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

      if (files && files.length > 0) {
        const uploadedDocs = await this.fileService.uploadFiles(
          files,
          'customers',
          (dto as any).documentType || 'GENERAL',
        );
        const existingDocs = existing.documents || [];
        dto.documents = [...existingDocs, ...uploadedDocs];
      }

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

  // ==========================================
  // GUARANTOR SUB-RESOURCE ACTIONS
  // ==========================================

  // --- CREATE GUARANTOR ---
  @Post(':id/guarantors')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('canCreate')
  @UseInterceptors(FilesInterceptor('files', 10, { limits: { fileSize: 25 * 1024 * 1024 } }))
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

      if (files && files.length > 0) {
        const uploadedDocs = await this.fileService.uploadFiles(
          files,
          'guarantors',
          (dto as any).documentType || 'GENERAL',
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
  @UseInterceptors(FilesInterceptor('files', 10, { limits: { fileSize: 25 * 1024 * 1024 } }))
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

      if (files && files.length > 0) {
        const uploadedDocs = await this.fileService.uploadFiles(
          files,
          'guarantors',
          (dto as any).documentType || 'GENERAL',
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
