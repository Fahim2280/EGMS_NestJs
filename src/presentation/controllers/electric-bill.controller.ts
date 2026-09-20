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
import { GetCustomerBillSummaryQuery } from '@application/queries/impl/get-customer-bill-summary.query';
import { PreviewElectricBillQuery } from '@application/queries/impl/preview-electric-bill.query';
import { GetCompanyByIdQuery } from '@application/queries/impl/get-company-by-id.query';
import { JwtAuthGuard } from '@infrastructure/auth/jwt-auth.guard';
import { RolesGuard } from '@infrastructure/auth/roles.guard';
import { Roles } from '@infrastructure/auth/roles.decorator';

@Controller('bills')
@UseGuards(JwtAuthGuard)
export class ElectricBillController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  async listBills(
    @Req() req: Request,
    @Res() res: Response,
    @Query('page') page?: string,
  ) {
    const user = (req as any).user;
    const currentPage = Math.max(1, parseInt(page || '1', 10));
    const pageSize = 15;

    const bills = await this.queryBus.execute(
      new GetElectricBillsByCompanyQuery(user.companyId),
    );

    const totalCount = bills.length;
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
    const safePage = Math.min(currentPage, totalPages);
    const paginated = bills.slice((safePage - 1) * pageSize, safePage * pageSize);

    return res.render('bills/index', {
      title: 'Electric Bills Ledger - EGMS Portal',
      activeNav: 'bills',
      user,
      isSuperAdmin: user.role === 'SUPER_ADMIN',
      bills: paginated,
      totalBillsCount: totalCount,
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
  @UseGuards(RolesGuard)
  @Roles('SUPER_ADMIN')
  async renderCreateForm(
    @Query('customerId') customerId: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const user = (req as any).user;

    const [customers, company] = await Promise.all([
      this.queryBus.execute(new GetCustomersByCompanyQuery(user.companyId)),
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
  @UseGuards(RolesGuard)
  @Roles('SUPER_ADMIN')
  async handleCreate(
    @Body() dto: CreateElectricBillDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const user = (req as any).user;
    if (!user) return res.redirect('/login');

    try {
      await this.commandBus.execute(
        new CreateElectricBillCommand(
          user.companyId,
          dto,
          `${user.sub || user.companyId}|${user.role || 'SUPER_ADMIN'}`,
        ),
      );

      return res.redirect('/bills');
    } catch (err: any) {
      const [customers, company] = await Promise.all([
        this.queryBus.execute(new GetCustomersByCompanyQuery(user.companyId)),
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

    try {
      const bill = await this.queryBus.execute(
        new GetElectricBillByIdQuery(id, user.companyId),
      );

      return res.render('bills/details', {
        title: `Bill Receipt #${bill.billNumber || bill.id.substring(0, 8)} - Garage Portal`,
        activeNav: 'bills',
        user,
        bill,
      });
    } catch {
      return res.redirect('/bills');
    }
  }

  @Get(':id/edit')
  @UseGuards(RolesGuard)
  @Roles('SUPER_ADMIN')
  async renderEditForm(
    @Param('id') id: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const user = (req as any).user;
    if (!user) return res.redirect('/login');

    try {
      const bill = await this.queryBus.execute(
        new GetElectricBillByIdQuery(id, user.companyId),
      );

      const customers = await this.queryBus.execute(
        new GetCustomersByCompanyQuery(user.companyId),
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
  @UseGuards(RolesGuard)
  @Roles('SUPER_ADMIN')
  async handleUpdate(
    @Param('id') id: string,
    @Body() dto: UpdateElectricBillDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const user = (req as any).user;
    if (!user) return res.redirect('/login');

    try {
      dto.id = id;
      await this.commandBus.execute(
        new UpdateElectricBillCommand(
          id,
          user.companyId,
          dto,
          `${user.sub || user.companyId}|${user.role || 'SUPER_ADMIN'}`,
        ),
      );

      return res.redirect(`/bills/${id}`);
    } catch (err: any) {
      const bill = await this.queryBus.execute(
        new GetElectricBillByIdQuery(id, user.companyId),
      );
      const customers = await this.queryBus.execute(
        new GetCustomersByCompanyQuery(user.companyId),
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
  @UseGuards(RolesGuard)
  @Roles('SUPER_ADMIN')
  async handleDelete(
    @Param('id') id: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const user = (req as any).user;
    if (!user) return res.redirect('/login');

    try {
      await this.commandBus.execute(
        new DeleteElectricBillCommand(
          id,
          user.companyId,
          `${user.sub || user.companyId}|${user.role || 'SUPER_ADMIN'}`,
        ),
      );
    } catch {
      // ignore
    }

    return res.redirect('/bills');
  }

  @Post('generate-monthly')
  @UseGuards(RolesGuard)
  @Roles('SUPER_ADMIN')
  async handleGenerateMonthly(
    @Body('targetDate') targetDateStr: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const user = (req as any).user;
    if (!user) return res.redirect('/login');

    const targetDate = targetDateStr ? new Date(targetDateStr) : new Date();

    await this.commandBus.execute(
      new GenerateMonthlyBillsCommand(
        user.companyId,
        targetDate,
        `${user.sub || user.companyId}|${user.role || 'SUPER_ADMIN'}`,
      ),
    );

    return res.redirect('/bills');
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
