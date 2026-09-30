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
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Request, Response } from 'express';
import {
  CreateElectricBillDto,
  UpdateElectricBillDto,
  PreviewBillRequestDto,
} from '@application/dtos/electric-bill.dto';
import { CreateElectricBillCommand } from '@application/commands/impl/create-electric-bill.command';
import { UpdateElectricBillCommand } from '@application/commands/impl/update-electric-bill.command';
import { DeleteElectricBillCommand } from '@application/commands/impl/delete-electric-bill.command';
import { GenerateMonthlyBillsCommand } from '@application/commands/impl/generate-monthly-bills.command';
import { GetElectricBillsByCompanyQuery } from '@application/queries/impl/get-electric-bills-by-company.query';
import { GetElectricBillByIdQuery } from '@application/queries/impl/get-electric-bill-by-id.query';
import { GetCustomersByCompanyQuery } from '@application/queries/impl/get-customers-by-company.query';
import { GetCustomerByIdQuery } from '@application/queries/impl/get-customer-by-id.query';
import { GetCustomerBillSummaryQuery } from '@application/queries/impl/get-customer-bill-summary.query';
import { PreviewElectricBillQuery } from '@application/queries/impl/preview-electric-bill.query';
import { GetCompanyByIdQuery } from '@application/queries/impl/get-company-by-id.query';
import { GetGaragesByCompanyQuery } from '@application/queries/impl/get-garages-by-company.query';
import { JwtAuthGuard } from '@infrastructure/auth/jwt-auth.guard';
import { PermissionsGuard } from '@infrastructure/auth/permissions.guard';
import { RequirePermissions } from '@infrastructure/auth/permissions.decorator';
import { AuditLogService } from '@application/services/audit-log.service';

@Controller('bills')
@UseGuards(JwtAuthGuard)
export class ElectricBillController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly auditLogService: AuditLogService,
  ) {}

  @Get()
  async listBills(
    @Req() req: Request,
    @Res() res: Response,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
    @Query('garageId') garageId?: string,
    @Query('search') search?: string,
    @Query('preset') preset?: string,
    @Query('page') page?: string,
  ) {
    const user = (req as any).user;
    const isSuperAdmin = user.role === 'SUPER_ADMIN' || user.isSuperAdmin;
    const allowedGarageIds = isSuperAdmin ? null : (user.garageIds || []);

    const currentPage = Math.max(1, parseInt(page || '1', 10));
    const pageSize = 15;

    const parsedFromDate = fromDate ? new Date(fromDate) : undefined;
    const parsedToDate = toDate ? new Date(toDate) : undefined;

    const [bills, garages] = await Promise.all([
      this.queryBus.execute(
        new GetElectricBillsByCompanyQuery(
          user.companyId,
          allowedGarageIds,
          parsedFromDate,
          parsedToDate,
          garageId,
          search,
        ),
      ),
      this.queryBus.execute(
        new GetGaragesByCompanyQuery(user.companyId, allowedGarageIds),
      ),
    ]);

    // Aggregate metrics across all filtered bills
    let totalUnits = 0;
    let totalElectric = 0;
    let totalBilled = 0;
    let totalPaid = 0;
    let totalDues = 0;
    for (const b of bills) {
      totalUnits += b.totalUnit || 0;
      totalElectric += b.electricBill || 0;
      totalBilled += b.totalBill || 0;
      totalPaid += b.clearMoney || 0;
      totalDues += b.presentDues || 0;
    }
    const summary = {
      totalUnits,
      totalElectric,
      totalBilled,
      totalPaid,
      totalDues,
    };

    const totalCount = bills.length;
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
    const safePage = Math.min(currentPage, totalPages);
    const paginated = bills.slice((safePage - 1) * pageSize, safePage * pageSize);

    const now = new Date();
    const defaultFromDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const defaultToDate = now.toISOString().split('T')[0];

    return res.render('bills/index', {
      title: 'Electric Bills Ledger - EGMS Portal',
      activeNav: 'bills',
      user,
      isSuperAdmin,
      canCreate: isSuperAdmin || Boolean(user.canCreate),
      canEdit: isSuperAdmin || Boolean(user.canEdit),
      canDelete: isSuperAdmin || Boolean(user.canDelete),
      canView: isSuperAdmin || Boolean(user.canView),
      bills: paginated,
      totalBillsCount: totalCount,
      garages,
      selectedGarageId: garageId || '',
      fromDate: fromDate || '',
      toDate: toDate || '',
      search: search || '',
      preset: preset || '',
      summary,
      defaultFromDate,
      defaultToDate,
      todayDate: defaultToDate,
      pagination: {
        page: safePage,
        totalPages,
        totalCount,
        hasNext: safePage < totalPages,
        hasPrev: safePage > 1,
      },
    });
  }

  @Get('new')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('canCreate')
  async renderCreateForm(
    @Query('customerId') customerId: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const user = (req as any).user;
    const isSuperAdmin = user.role === 'SUPER_ADMIN' || user.isSuperAdmin;
    const allowedGarageIds = isSuperAdmin ? null : (user.garageIds || []);

    const [customers, company] = await Promise.all([
      this.queryBus.execute(new GetCustomersByCompanyQuery(user.companyId, allowedGarageIds)),
      this.queryBus.execute(new GetCompanyByIdQuery(user.companyId)).catch(() => null),
    ]);

    let preselectedCustomer = null;
    let initialSummary = null;

    if (customerId) {
      preselectedCustomer = customers.find((c: any) => c.id === customerId);
      if (preselectedCustomer) {
        try {
          initialSummary = await this.queryBus.execute(
            new GetCustomerBillSummaryQuery(customerId, user.companyId),
          );
        } catch {
          // ignore
        }
      }
    }

    return res.render('bills/create', {
      title: 'Generate Electric Bill - Garage Portal',
      activeNav: 'bills',
      user,
      customers,
      preselectedCustomerId: customerId,
      initialSummary,
      defaultUnitRate: company?.unitRate || 15,
      todayDate: new Date().toISOString().split('T')[0],
    });
  }

  @Post()
  @UseGuards(PermissionsGuard)
  @RequirePermissions('canCreate')
  async handleCreate(
    @Body() dto: CreateElectricBillDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const user = (req as any).user;
    if (!user) return res.redirect('/login');
    const isSuperAdmin = user.role === 'SUPER_ADMIN' || user.isSuperAdmin;
    const allowedGarageIds = isSuperAdmin ? null : (user.garageIds || []);

    // Verify that the customer belongs to an allowed garage
    if (!isSuperAdmin) {
      try {
        const targetCustomer = await this.queryBus.execute(
          new GetCustomerByIdQuery(dto.customerId, user.companyId),
        );
        if (targetCustomer?.garageId && !user.garageIds?.includes(targetCustomer.garageId)) {
          const [customers, company] = await Promise.all([
            this.queryBus.execute(new GetCustomersByCompanyQuery(user.companyId, allowedGarageIds)),
            this.queryBus.execute(new GetCompanyByIdQuery(user.companyId)).catch(() => null),
          ]);
          return res.render('bills/create', {
            title: 'Generate Electric Bill - Garage Portal',
            activeNav: 'bills',
            user,
            customers,
            error: 'You do not have permission to generate bills for customers in this garage.',
            formData: dto,
            defaultUnitRate: company?.unitRate || 15,
            todayDate: dto.date || new Date().toISOString().split('T')[0],
          });
        }
      } catch {
        // continue to command execution
      }
    }

    try {
      await this.commandBus.execute(
        new CreateElectricBillCommand(
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
        entityType: 'ELECTRIC_BILL',
        details: `Generated electric bill for customer ${dto.customerId} (meter reading: ${dto.currentUnit})`,
        req,
      });

      return res.redirect('/bills?success=msg.billCreated');
    } catch (err: any) {
      const [customers, company] = await Promise.all([
        this.queryBus.execute(new GetCustomersByCompanyQuery(user.companyId, allowedGarageIds)),
        this.queryBus.execute(new GetCompanyByIdQuery(user.companyId)).catch(() => null),
      ]);

      return res.render('bills/create', {
        title: 'Generate Electric Bill - Garage Portal',
        activeNav: 'bills',
        user,
        customers,
        error: err.message || 'Failed to generate electric bill.',
        formData: dto,
        defaultUnitRate: company?.unitRate || 15,
        todayDate: dto.date || new Date().toISOString().split('T')[0],
      });
    }
  }

  @Get(':id')
  async renderDetails(
    @Param('id') id: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const user = (req as any).user;
    if (!user) return res.redirect('/login');
    const isSuperAdmin = user.role === 'SUPER_ADMIN' || user.isSuperAdmin;

    try {
      const bill = await this.queryBus.execute(
        new GetElectricBillByIdQuery(id, user.companyId),
      );

      // Verify garage permission via customer
      if (!isSuperAdmin) {
        const customer = await this.queryBus.execute(
          new GetCustomerByIdQuery(bill.customerId, user.companyId),
        );
        if (customer?.garageId && !user.garageIds?.includes(customer.garageId)) {
          return res.redirect('/bills?error=You+do+not+have+permission+to+view+this+bill');
        }
      }

      return res.render('bills/details', {
        title: `Bill Receipt #${bill.billNumber || bill.id.substring(0, 8)} - Garage Portal`,
        activeNav: 'bills',
        user,
        isSuperAdmin,
        canCreate: isSuperAdmin || Boolean(user.canCreate),
        canEdit: isSuperAdmin || Boolean(user.canEdit),
        canDelete: isSuperAdmin || Boolean(user.canDelete),
        bill,
      });
    } catch {
      return res.redirect('/bills');
    }
  }

  @Get(':id/edit')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('canEdit')
  async renderEditForm(
    @Param('id') id: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const user = (req as any).user;
    if (!user) return res.redirect('/login');
    const isSuperAdmin = user.role === 'SUPER_ADMIN' || user.isSuperAdmin;
    const allowedGarageIds = isSuperAdmin ? null : (user.garageIds || []);

    try {
      const bill = await this.queryBus.execute(
        new GetElectricBillByIdQuery(id, user.companyId),
      );

      // Verify customer garage access
      if (!isSuperAdmin) {
        const customer = await this.queryBus.execute(
          new GetCustomerByIdQuery(bill.customerId, user.companyId),
        );
        if (customer?.garageId && !user.garageIds?.includes(customer.garageId)) {
          return res.redirect('/bills?error=You+do+not+have+permission+to+edit+this+bill');
        }
      }

      const customers = await this.queryBus.execute(
        new GetCustomersByCompanyQuery(user.companyId, allowedGarageIds),
      );

      return res.render('bills/edit', {
        title: `Edit Electric Bill #${bill.billNumber || bill.id.substring(0, 8)} - Garage Portal`,
        activeNav: 'bills',
        user,
        bill,
        customers,
        billDateStr: new Date(bill.date).toISOString().split('T')[0],
      });
    } catch {
      return res.redirect('/bills');
    }
  }

  @Post(':id/edit')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('canEdit')
  async handleUpdate(
    @Param('id') id: string,
    @Body() dto: UpdateElectricBillDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const user = (req as any).user;
    if (!user) return res.redirect('/login');
    const isSuperAdmin = user.role === 'SUPER_ADMIN' || user.isSuperAdmin;
    const allowedGarageIds = isSuperAdmin ? null : (user.garageIds || []);

    try {
      const existing = await this.queryBus.execute(
        new GetElectricBillByIdQuery(id, user.companyId),
      );

      if (!isSuperAdmin) {
        const customer = await this.queryBus.execute(
          new GetCustomerByIdQuery(existing.customerId, user.companyId),
        );
        if (customer?.garageId && !user.garageIds?.includes(customer.garageId)) {
          return res.redirect('/bills?error=You+do+not+have+permission+to+edit+this+bill');
        }
      }

      dto.id = id;
      await this.commandBus.execute(
        new UpdateElectricBillCommand(
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
        entityType: 'ELECTRIC_BILL',
        entityId: id,
        details: `Updated electric bill #${id}`,
        req,
      });

      return res.redirect(`/bills/${id}?success=msg.billUpdated`);
    } catch (err: any) {
      const bill = await this.queryBus.execute(
        new GetElectricBillByIdQuery(id, user.companyId),
      );
      const customers = await this.queryBus.execute(
        new GetCustomersByCompanyQuery(user.companyId, allowedGarageIds),
      );

      return res.render('bills/edit', {
        title: 'Edit Electric Bill - Garage Portal',
        activeNav: 'bills',
        user,
        bill: { ...bill, ...dto },
        customers,
        error: err.message || 'Failed to update electric bill.',
      });
    }
  }

  @Post(':id/delete')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('canDelete')
  async handleDelete(
    @Param('id') id: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const user = (req as any).user;
    if (!user) return res.redirect('/login');
    const isSuperAdmin = user.role === 'SUPER_ADMIN' || user.isSuperAdmin;

    try {
      const existing = await this.queryBus.execute(
        new GetElectricBillByIdQuery(id, user.companyId),
      );

      if (!isSuperAdmin) {
        const customer = await this.queryBus.execute(
          new GetCustomerByIdQuery(existing.customerId, user.companyId),
        );
        if (customer?.garageId && !user.garageIds?.includes(customer.garageId)) {
          return res.redirect('/bills?error=msg.permissionDenied');
        }
      }

      await this.commandBus.execute(
        new DeleteElectricBillCommand(
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
        entityType: 'ELECTRIC_BILL',
        entityId: id,
        details: `Deleted electric bill #${id}`,
        req,
      });

    } catch (err: any) {
      return res.redirect(`/bills?error=${encodeURIComponent(err.message || 'Failed to delete electric bill.')}`);
    }
  }

  @Post('generate-monthly')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('canCreate')
  async handleGenerateMonthly(
    @Body('fromDate') fromDateStr: string,
    @Body('toDate') toDateStr: string,
    @Body('targetDate') targetDateStr: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const user = (req as any).user;
    if (!user) return res.redirect('/login');

    const toDate = toDateStr
      ? new Date(toDateStr)
      : targetDateStr
        ? new Date(targetDateStr)
        : new Date();
    const fromDate = fromDateStr
      ? new Date(fromDateStr)
      : new Date(toDate.getFullYear(), toDate.getMonth(), 1);

    await this.commandBus.execute(
      new GenerateMonthlyBillsCommand(
        user.companyId,
        toDate,
        `${user.sub || user.companyId}|${user.role || 'SUPER_ADMIN'}`,
        fromDate,
      ),
    );

    await this.auditLogService.record({
      companyId: user.companyId,
      userId: user.sub || user.companyId,
      userName: user.name,
      userRole: user.role,
      action: 'CREATE',
      entityType: 'ELECTRIC_BILL',
      details: `Generated monthly electric bills for all eligible customers`,
      req,
    });

    return res.redirect('/bills?success=msg.billsBatchGenerated');
  }

  // --- AJAX Endpoints for Real-Time UI Calculations ---

  @Get('api/customer-summary/:customerId')
  async getCustomerSummary(
    @Param('customerId') customerId: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    try {
      const summary = await this.queryBus.execute(
        new GetCustomerBillSummaryQuery(customerId, user.companyId),
      );
      return res.json({ success: true, data: summary });
    } catch (err: any) {
      return res.status(404).json({ success: false, message: err.message });
    }
  }

  @Post('api/preview')
  async previewBill(
    @Body() dto: PreviewBillRequestDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    try {
      const preview = await this.queryBus.execute(
        new PreviewElectricBillQuery(
          dto.customerId,
          user.companyId,
          Number(dto.currentMeterReading) || 0,
          Number(dto.rentBill) || 0,
          Number(dto.loan) || 0,
          dto.unitRate !== undefined && dto.unitRate !== null ? Number(dto.unitRate) : undefined,
        ),
      );
      return res.json({ success: true, data: preview });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }
}
