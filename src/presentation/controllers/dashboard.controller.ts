import { Controller, Get, Param, Req, Res } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { Request, Response } from 'express';
import { GetCompanyByIdQuery } from '@application/queries/impl/get-company-by-id.query';
import { GetGaragesByCompanyQuery } from '@application/queries/impl/get-garages-by-company.query';
import { GetEmployeesByCompanyQuery } from '@application/queries/impl/get-employees-by-company.query';
import { GetDashboardStatsQuery } from '@application/queries/impl/get-dashboard-stats.query';
import { GetExecutiveDashboardQuery } from '@application/queries/impl/get-executive-dashboard.query';

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
    const [company, garages, employees, stats, execDashboard] = await Promise.all([
      this.queryBus.execute(new GetCompanyByIdQuery(companyId)),
      this.queryBus.execute(new GetGaragesByCompanyQuery(companyId)),
      this.queryBus.execute(new GetEmployeesByCompanyQuery(companyId)),
      this.queryBus.execute(new GetDashboardStatsQuery(companyId)),
      this.queryBus.execute(new GetExecutiveDashboardQuery(companyId)),
    ]);

    return res.render('dashboard', {
      title: `${company?.companyName || 'Dashboard'} - Electric Garage Portal`,
      activeNav: 'dashboard',
      user,
      company,
      garages,
      employees,
      stats,
      execDashboard,
      // Direct access fields matching ASP.NET Core ViewBag variables:
      totalAdvanceMoney: execDashboard.totalAdvanceMoney,
      totalPresentDues: execDashboard.totalPresentDues,
      balance: execDashboard.balance,
      customerCount: execDashboard.customerCount,
      customersWithBills: execDashboard.customersWithBills,
      customersWithoutBills: execDashboard.customersWithoutBills,
      customers: execDashboard.customers,
    });
  }

  // --- LANGUAGE SWITCH ROUTE ---
  @Get('lang/:locale')
  setLanguage(@Param('locale') locale: string, @Req() req: Request, @Res() res: Response) {
    const lang = locale === 'bn' ? 'bn' : 'en';
    res.cookie('lang', lang, {
      maxAge: 365 * 24 * 60 * 60 * 1000,
      httpOnly: false,
      sameSite: 'lax',
    });
    const referer = req.get('Referrer') || '/';
    return res.redirect(referer);
  }

  // --- THEME SWITCH ROUTE ---
  @Get('theme/:mode')
  setTheme(@Param('mode') mode: string, @Req() req: Request, @Res() res: Response) {
    const theme = mode === 'light' ? 'light' : 'dark';
    res.cookie('theme', theme, {
      maxAge: 365 * 24 * 60 * 60 * 1000,
      httpOnly: false,
      sameSite: 'lax',
    });
    const referer = req.get('Referrer') || '/';
    return res.redirect(referer);
  }
}
