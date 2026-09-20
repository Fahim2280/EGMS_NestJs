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

@Controller('garages')
@UseGuards(JwtAuthGuard)
export class GarageController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  // --- VIEW: All company garages ---
  @Get()
  async listGarages(@Req() req: Request, @Res() res: Response) {
    const user = (req as any).user;

    const garages = await this.queryBus.execute(
      new GetGaragesByCompanyQuery(user.companyId),
    );

    return res.render('garages/index', {
      title: 'Company Garages - EGMS Portal',
      activeNav: 'garages',
      user,
      isSuperAdmin: user.role === 'SUPER_ADMIN',
      garages,
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
    @Query('success') success?: string,
  ) {
    const user = (req as any).user;
    try {
      const data = await this.queryBus.execute(
        new GetGarageDashboardQuery(id, user.companyId),
      );

      return res.render('garages/dashboard', {
        title: `${data.garage.garageName} - Garage Dashboard`,
        activeNav: 'garages',
        user,
        isSuperAdmin: user.role === 'SUPER_ADMIN',
        garage: data.garage,
        metrics: data.metrics,
        customers: data.customers,
        recentBills: data.recentBills,
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
        isSuperAdmin: user.role === 'SUPER_ADMIN',
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
