import { Controller, Get, Req, Res } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { Request, Response } from 'express';
import { GetCompanyByIdQuery } from '@application/queries/impl/get-company-by-id.query';
import { GetGaragesByCompanyQuery } from '@application/queries/impl/get-garages-by-company.query';
import { GetEmployeesByCompanyQuery } from '@application/queries/impl/get-employees-by-company.query';
import { GetDashboardStatsQuery } from '@application/queries/impl/get-dashboard-stats.query';

@Controller()
export class DashboardController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get()
  async renderDashboard(@Req() req: Request, @Res() res: Response) {
    const user = (req as any).user;
    if (!user) {
      return res.redirect('/login');
    }

    const companyId = user.companyId;
    const [company, garages, employees, stats] = await Promise.all([
      this.queryBus.execute(new GetCompanyByIdQuery(companyId)),
      this.queryBus.execute(new GetGaragesByCompanyQuery(companyId)),
      this.queryBus.execute(new GetEmployeesByCompanyQuery(companyId)),
      this.queryBus.execute(new GetDashboardStatsQuery(companyId)),
    ]);

    return res.render('dashboard', {
      title: `${company?.companyName || 'Dashboard'} - Portal`,
      activeNav: 'dashboard',
      user,
      company,
      garages,
      employees,
      stats,
    });
  }
}
