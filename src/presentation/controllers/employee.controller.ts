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
import { CreateEmployeeDto } from '@application/dtos/employee.dto';
import { CreateEmployeeCommand } from '@application/commands/impl/create-employee.command';
import { GetEmployeesByCompanyQuery } from '@application/queries/impl/get-employees-by-company.query';

@Controller('employees')
export class EmployeeController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  async listEmployees(@Req() req: Request, @Res() res: Response) {
    const user = (req as any).user;
    if (!user) {
      return res.redirect('/login');
    }

    const employees = await this.queryBus.execute(
      new GetEmployeesByCompanyQuery(user.companyId),
    );

    return res.render('employees/index', {
      title: 'Employee Roster - Portal',
      activeNav: 'employees',
      user,
      isSuperAdmin: user.role === 'SUPER_ADMIN',
      employees,
    });
  }

  @Get('new')
  renderCreateForm(@Req() req: Request, @Res() res: Response) {
    const user = (req as any).user;
    if (!user) {
      return res.redirect('/login');
    }

    if (user.role !== 'SUPER_ADMIN') {
      return res.redirect('/employees');
    }

    return res.render('employees/create', {
      title: 'Add New Employee - Portal',
      activeNav: 'employees',
      user,
    });
  }

  @Post()
  async handleCreate(
    @Req() req: Request,
    @Body() dto: CreateEmployeeDto,
    @Res() res: Response,
  ) {
    const user = (req as any).user;
    if (!user) {
      return res.redirect('/login');
    }

    if (user.role !== 'SUPER_ADMIN') {
      return res.redirect('/employees');
    }

    try {
      await this.commandBus.execute(
        new CreateEmployeeCommand(user.companyId, dto),
      );
      return res.redirect('/employees');
    } catch (err: any) {
      return res.render('employees/create', {
        title: 'Add New Employee - Portal',
        activeNav: 'employees',
        user,
        error: err.message || 'Failed to create employee',
        formData: dto,
      });
    }
  }
}
