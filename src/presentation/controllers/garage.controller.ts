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
import { CreateGarageDto, UpdateGarageDto } from '@application/dtos/garage.dto';
import { CreateGarageCommand } from '@application/commands/impl/create-garage.command';
import { UpdateGarageCommand } from '@application/commands/impl/update-garage.command';
import { GetGaragesByCompanyQuery } from '@application/queries/impl/get-garages-by-company.query';
import { GetGarageByIdQuery } from '@application/queries/impl/get-garage-by-id.query';
import { GetGarageDashboardQuery } from '@application/queries/impl/get-garage-dashboard.query';
import { JwtAuthGuard } from '@infrastructure/auth/jwt-auth.guard';
import { RolesGuard } from '@infrastructure/auth/roles.guard';
import { Roles } from '@infrastructure/auth/roles.decorator';
import { AuditLogService } from '@application/services/audit-log.service';

@Controller('garages')
@UseGuards(JwtAuthGuard)
export class GarageController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly auditLogService: AuditLogService,
  ) {}

  // --- VIEW: All company garages ---
  @Get()
  async listGarages(
    @Req() req: Request,
    @Res() res: Response,
    @Query('search') search?: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
    @Query('preset') preset?: string,
  ) {
    const user = (req as any).user;
    const isSuperAdmin = user.role === 'SUPER_ADMIN' || user.isSuperAdmin;
    const allowedGarageIds = isSuperAdmin ? null : (user.garageIds || []);

    let garages = await this.queryBus.execute(
      new GetGaragesByCompanyQuery(user.companyId, allowedGarageIds),
    );

    // Filter by search query (name, address)
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      garages = garages.filter(
        (g: any) =>
          g.garageName?.toLowerCase().includes(q) ||
          g.address?.toLowerCase().includes(q),
      );
    }

    // Filter by creation date range
    if (fromDate) {
      const fromTime = new Date(fromDate).setHours(0, 0, 0, 0);
      garages = garages.filter((g: any) => {
        const d = g.createdDate || g.createdAt;
        return d && new Date(d).getTime() >= fromTime;
      });
    }

    if (toDate) {
      const toTime = new Date(toDate).setHours(23, 59, 59, 999);
      garages = garages.filter((g: any) => {
        const d = g.createdDate || g.createdAt;
        return d && new Date(d).getTime() <= toTime;
      });
    }

    return res.render('garages/index', {
      title: 'Company Garages - EGMS Portal',
      activeNav: 'garages',
      user,
      isSuperAdmin,
      canCreate: isSuperAdmin || Boolean(user.canCreate),
      canEdit: isSuperAdmin || Boolean(user.canEdit),
      canDelete: isSuperAdmin || Boolean(user.canDelete),
      canView: isSuperAdmin || Boolean(user.canView),
      garages,
      totalGaragesCount: garages.length,
      search: search || '',
      fromDate: fromDate || '',
      toDate: toDate || '',
      preset: preset || '',
    });
  }

  // --- CREATE: Form (SUPER_ADMIN only) ---
  @Get('new')
  @UseGuards(RolesGuard)
  @Roles('SUPER_ADMIN')
  renderCreateForm(@Req() req: Request, @Res() res: Response) {
    const user = (req as any).user;
    return res.render('garages/create', {
      title: 'Register New Garage - EGMS Portal',
      activeNav: 'garages',
      user,
    });
  }

  // --- CREATE: Submit (SUPER_ADMIN only) ---
  @Post()
  @UseGuards(RolesGuard)
  @Roles('SUPER_ADMIN')
  async handleCreate(
    @Req() req: Request,
    @Body() dto: CreateGarageDto,
    @Res() res: Response,
  ) {
    const user = (req as any).user;
    try {
      await this.commandBus.execute(
        new CreateGarageCommand(user.companyId, dto),
      );

      await this.auditLogService.record({
        companyId: user.companyId,
        userId: user.sub || user.companyId,
        userName: user.name,
        userRole: user.role,
        action: 'CREATE',
        entityType: 'GARAGE',
        entityName: dto.garageName,
        details: `Registered new garage facility: ${dto.garageName} located at ${dto.address || 'N/A'}`,
        req,
      });

      return res.redirect('/garages?success=Garage+registered+successfully');
    } catch (err: any) {
      return res.render('garages/create', {
        title: 'Register New Garage - EGMS Portal',
        activeNav: 'garages',
        user,
        error: err.message || 'Failed to create garage',
        formData: dto,
      });
    }
  }

  // --- VIEW: Dedicated Garage Dashboard ---
  @Get(':id')
  async renderDashboard(
    @Param('id') id: string,
    @Req() req: Request,
    @Res() res: Response,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
    @Query('preset') preset?: string,
    @Query('success') success?: string,
  ) {
    const user = (req as any).user;
    const isSuperAdmin = user.role === 'SUPER_ADMIN' || user.isSuperAdmin;

    // Check garage permission for non-super admins
    if (!isSuperAdmin) {
      const allowed = user.garageIds && Array.isArray(user.garageIds) && user.garageIds.includes(id);
      if (!allowed) {
        return res.redirect('/garages?error=You+do+not+have+permission+to+view+this+garage');
      }
    }

    try {
      const parsedFromDate = fromDate ? new Date(fromDate) : undefined;
      const parsedToDate = toDate ? new Date(toDate) : undefined;

      const data = await this.queryBus.execute(
        new GetGarageDashboardQuery(id, user.companyId, parsedFromDate, parsedToDate),
      );

      return res.render('garages/dashboard', {
        title: `${data.garage.garageName} - Garage Dashboard`,
        activeNav: 'garages',
        user,
        isSuperAdmin,
        canCreate: isSuperAdmin || Boolean(user.canCreate),
        canEdit: isSuperAdmin || Boolean(user.canEdit),
        canDelete: isSuperAdmin || Boolean(user.canDelete),
        garage: data.garage,
        metrics: data.metrics,
        customers: data.customers,
        recentBills: data.recentBills,
        totalFilteredBillsCount: data.totalFilteredBillsCount || data.recentBills.length,
        fromDate: fromDate || '',
        toDate: toDate || '',
        preset: preset || '',
        successMessage: success,
      });
    } catch (err: any) {
      return res.redirect('/garages?error=Garage+not+found');
    }
  }

  // --- EDIT: Form (SUPER_ADMIN only) ---
  @Get(':id/edit')
  @UseGuards(RolesGuard)
  @Roles('SUPER_ADMIN')
  async renderEditForm(
    @Param('id') id: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const user = (req as any).user;
    try {
      const garage = await this.queryBus.execute(
        new GetGarageByIdQuery(id, user.companyId),
      );

      return res.render('garages/edit', {
        title: `Edit Garage: ${garage.garageName} - EGMS Portal`,
        activeNav: 'garages',
        user,
        isSuperAdmin: user.role === 'SUPER_ADMIN' || user.isSuperAdmin,
        garage,
      });
    } catch {
      return res.redirect('/garages');
    }
  }

  // --- EDIT: Submit (SUPER_ADMIN only) ---
  @Post(':id/edit')
  @UseGuards(RolesGuard)
  @Roles('SUPER_ADMIN')
  async handleUpdate(
    @Param('id') id: string,
    @Body() dto: UpdateGarageDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const user = (req as any).user;
    try {
      await this.commandBus.execute(
        new UpdateGarageCommand(
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
        entityType: 'GARAGE',
        entityId: id,
        entityName: dto.garageName,
        details: `Updated garage facility: ${dto.garageName}`,
        req,
      });

      return res.redirect(`/garages/${id}?success=Garage+details+updated+successfully`);
    } catch (err: any) {
      return res.render('garages/edit', {
        title: 'Edit Garage - EGMS Portal',
        activeNav: 'garages',
        user,
        isSuperAdmin: user.role === 'SUPER_ADMIN',
        garage: { id, ...dto },
        error: err.message || 'Failed to update garage',
      });
    }
  }
}
