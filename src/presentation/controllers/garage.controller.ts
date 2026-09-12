import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Request, Response } from 'express';
import { CreateGarageDto } from '@application/dtos/garage.dto';
import { CreateGarageCommand } from '@application/commands/impl/create-garage.command';
import { GetGaragesByCompanyQuery } from '@application/queries/impl/get-garages-by-company.query';

@Controller('garages')
export class GarageController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  async listGarages(@Req() req: Request, @Res() res: Response) {
    const user = (req as any).user;
    if (!user) {
      return res.redirect('/login');
    }

    const garages = await this.queryBus.execute(
      new GetGaragesByCompanyQuery(user.companyId),
    );

    return res.render('garages/index', {
      title: 'Company Garages - Portal',
      activeNav: 'garages',
      user,
      isSuperAdmin: user.role === 'SUPER_ADMIN',
      garages,
    });
  }

  @Get('new')
  renderCreateForm(@Req() req: Request, @Res() res: Response) {
    const user = (req as any).user;
    if (!user) {
      return res.redirect('/login');
    }

    if (user.role !== 'SUPER_ADMIN') {
      return res.redirect('/garages');
    }

    return res.render('garages/create', {
      title: 'Register New Garage - Portal',
      activeNav: 'garages',
      user,
    });
  }

  @Post()
  async handleCreate(
    @Req() req: Request,
    @Body() dto: CreateGarageDto,
    @Res() res: Response,
  ) {
    const user = (req as any).user;
    if (!user) {
      return res.redirect('/login');
    }

    if (user.role !== 'SUPER_ADMIN') {
      return res.redirect('/garages');
    }

    try {
      await this.commandBus.execute(
        new CreateGarageCommand(user.companyId, dto),
      );
      return res.redirect('/garages');
    } catch (err: any) {
      return res.render('garages/create', {
        title: 'Register New Garage - Portal',
        activeNav: 'garages',
        user,
        error: err.message || 'Failed to create garage',
        formData: dto,
      });
    }
  }
}
