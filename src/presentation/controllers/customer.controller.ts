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
  CreateCustomerDto,
  UpdateCustomerDto,
} from '@application/dtos/customer.dto';
import { CreateCustomerCommand } from '@application/commands/impl/create-customer.command';
import { UpdateCustomerCommand } from '@application/commands/impl/update-customer.command';
import { DeleteCustomerCommand } from '@application/commands/impl/delete-customer.command';
import { GetCustomersByCompanyQuery } from '@application/queries/impl/get-customers-by-company.query';
import { GetCustomerByIdQuery } from '@application/queries/impl/get-customer-by-id.query';
import { JwtAuthGuard } from '@infrastructure/auth/jwt-auth.guard';
import { RolesGuard } from '@infrastructure/auth/roles.guard';
import { Roles } from '@infrastructure/auth/roles.decorator';

import { GetGaragesByCompanyQuery } from '@application/queries/impl/get-garages-by-company.query';

@Controller('customers')
@UseGuards(JwtAuthGuard)
export class CustomerController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  // --- VIEW: List customers (all authenticated users) ---
  @Get()
  async listCustomers(
    @Req() req: Request,
    @Res() res: Response,
    @Query('search') search?: string,
    @Query('garageId') garageId?: string,
    @Query('page') page?: string,
  ) {
    const user = (req as any).user;
    const currentPage = Math.max(1, parseInt(page || '1', 10));
    const pageSize = 15;

    let customers = await this.queryBus.execute(
      new GetCustomersByCompanyQuery(user.companyId),
    );

    const garages = await this.queryBus.execute(
      new GetGaragesByCompanyQuery(user.companyId),
    );

    // Filter by garage if selected
    if (garageId && garageId.trim()) {
      customers = customers.filter((c: any) => c.garageId === garageId.trim());
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
          c.garageName?.toLowerCase().includes(q),
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
      isSuperAdmin: user.role === 'SUPER_ADMIN',
      customers: paginated,
      customerCount: totalCount,
      garages,
      selectedGarageId: garageId || '',
      search: search || '',
      pagination: {
        page: safePage,
        totalPages,
        totalCount,
        hasNext: safePage < totalPages,
        hasPrev: safePage > 1,
      },
    });
  }

  // --- CREATE (SUPER_ADMIN only) ---
  @Get('new')
  @UseGuards(RolesGuard)
  @Roles('SUPER_ADMIN')
  async renderCreateForm(
    @Req() req: Request,
    @Res() res: Response,
    @Query('garageId') garageId?: string,
  ) {
    const user = (req as any).user;
    const garages = await this.queryBus.execute(
      new GetGaragesByCompanyQuery(user.companyId),
    );
    return res.render('customers/create', {
      title: 'Register New Customer - EGMS Portal',
      activeNav: 'customers',
      user,
      garages,
      selectedGarageId: garageId || '',
    });
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('SUPER_ADMIN')
  async handleCreate(
    @Body() dto: CreateCustomerDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const user = (req as any).user;
    try {
      await this.commandBus.execute(
        new CreateCustomerCommand(
          user.companyId,
          dto,
          `${user.sub || user.companyId}|${user.role || 'SUPER_ADMIN'}`,
        ),
      );
      return res.redirect('/customers?success=Customer+registered+successfully');
    } catch (err: any) {
      const garages = await this.queryBus.execute(
        new GetGaragesByCompanyQuery(user.companyId),
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

  // --- VIEW DETAILS (all authenticated) ---
  @Get(':id')
  async renderDetails(
    @Param('id') id: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const user = (req as any).user;
    try {
      const customer = await this.queryBus.execute(
        new GetCustomerByIdQuery(id, user.companyId),
      );
      return res.render('customers/details', {
        title: `Customer: ${customer.name} - EGMS Portal`,
        activeNav: 'customers',
        user,
        isSuperAdmin: user.role === 'SUPER_ADMIN',
        customer,
        bills: customer.bills || [],
      });
    } catch {
      return res.redirect('/customers');
    }
  }

  // --- EDIT (SUPER_ADMIN only) ---
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
      const customer = await this.queryBus.execute(
        new GetCustomerByIdQuery(id, user.companyId),
      );
      const garages = await this.queryBus.execute(
        new GetGaragesByCompanyQuery(user.companyId),
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
  @UseGuards(RolesGuard)
  @Roles('SUPER_ADMIN')
  async handleUpdate(
    @Param('id') id: string,
    @Body() dto: UpdateCustomerDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const user = (req as any).user;
    try {
      await this.commandBus.execute(
        new UpdateCustomerCommand(
          id,
          user.companyId,
          dto,
          `${user.sub || user.companyId}|${user.role || 'SUPER_ADMIN'}`,
        ),
      );
      return res.redirect(`/customers/${id}?success=Customer+updated`);
    } catch (err: any) {
      const garages = await this.queryBus.execute(
        new GetGaragesByCompanyQuery(user.companyId),
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

  // --- DELETE (SUPER_ADMIN only) ---
  @Post(':id/delete')
  @UseGuards(RolesGuard)
  @Roles('SUPER_ADMIN')
  async handleDelete(
    @Param('id') id: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const user = (req as any).user;
    try {
      await this.commandBus.execute(
        new DeleteCustomerCommand(
          id,
          user.companyId,
          `${user.sub || user.companyId}|${user.role || 'SUPER_ADMIN'}`,
        ),
      );
    } catch {
      // silently continue
    }
    return res.redirect('/customers?success=Customer+removed');
  }
}
