import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Response, Request } from 'express';
import { LoginDto } from '@application/dtos/auth.dto';
import { RegisterCompanyDto, UpdateCompanyDto } from '@application/dtos/company.dto';
import { LoginCommand } from '@application/commands/impl/login.command';
import { RegisterCompanyCommand } from '@application/commands/impl/register-company.command';
import { ForgotPasswordCommand } from '@application/commands/impl/forgot-password.command';
import { ResetPasswordCommand } from '@application/commands/impl/reset-password.command';
import { UpdateCompanyCommand } from '@application/commands/impl/update-company.command';
import { ApproveCompanyCommand } from '@application/commands/impl/approve-company.command';
import { RejectCompanyCommand } from '@application/commands/impl/reject-company.command';
import { GetCompanyByIdQuery } from '@application/queries/impl/get-company-by-id.query';
import { JwtAuthGuard } from '@infrastructure/auth/jwt-auth.guard';
import { RolesGuard } from '@infrastructure/auth/roles.guard';
import { Roles } from '@infrastructure/auth/roles.decorator';
import { AuditLogService } from '@application/services/audit-log.service';
import { AuthRateLimiterGuard } from '@infrastructure/auth/auth-rate-limiter.guard';
import { EmailService } from '@infrastructure/email/email.service';

@Controller()
export class AuthController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly auditLogService: AuditLogService,
    private readonly emailService: EmailService,
  ) {}

  @Get('login')
  renderLogin(
    @Query('message') message: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    if ((req as any).user) {
      return res.redirect('/');
    }
    return res.render('auth/login', {
      title: 'Sign In - Garage Portal',
      successMessage: message,
      activeNav: 'login',
    });
  }

  @Post('login')
  @UseGuards(AuthRateLimiterGuard)
  async handleLogin(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const result = await this.commandBus.execute(new LoginCommand(dto));
      const token = result.data.accessToken;

      res.cookie('jwt_token', token, {
        httpOnly: true,
        secure: (req as any).secure || process.env.HTTPS === 'true' || process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        sameSite: 'lax',
      });

      await this.auditLogService.record({
        companyId: result.data.user.companyId,
        userId: result.data.user.id,
        userName: result.data.user.name,
        userRole: result.data.user.role,
        action: 'LOGIN',
        entityType: 'AUTH',
        details: `User ${result.data.user.name} (${result.data.user.email}) signed in`,
        req,
      });

      return res.redirect('/');
    } catch (err: any) {
      return res.render('auth/login', {
        title: 'Sign In - Garage Portal',
        error: err.message || 'Invalid credentials',
        email: dto.email,
        activeNav: 'login',
      });
    }
  }

  @Get('register')
  renderRegister(@Req() req: Request, @Res() res: Response) {
    if ((req as any).user) {
      return res.redirect('/');
    }
    return res.render('auth/register', {
      title: 'Register Company - Garage Portal',
      activeNav: 'register',
    });
  }

  @Post('register')
  @UseGuards(AuthRateLimiterGuard)
  async handleRegister(
    @Body() dto: RegisterCompanyDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    if (dto.confirmPassword !== undefined && dto.confirmPassword !== dto.password) {
      const isBn = (req as any).lang === 'bn';
      return res.render('auth/register', {
        title: 'Register Company - Garage Portal',
        error: isBn ? 'পাসওয়ার্ড দুটি মেলেনি' : 'Passwords do not match',
        formData: dto,
        activeNav: 'register',
      });
    }

    try {
      await this.commandBus.execute(new RegisterCompanyCommand(dto));
      // Company is now PENDING approval — do NOT auto-login, show pending page instead
      return res.render('auth/register-pending', {
        title: 'Registration Submitted - Garage Portal',
        companyName: dto.companyName,
        email: dto.email,
        activeNav: 'register',
      });
    } catch (err: any) {
      return res.render('auth/register', {
        title: 'Register Company - Garage Portal',
        error: err.message || 'Registration failed',
        formData: dto,
        activeNav: 'register',
      });
    }
  }

  @Get('forgot-password')
  renderForgotPassword(@Req() req: Request, @Res() res: Response) {
    return res.render('auth/forgot-password', {
      title: 'Forgot Password - Garage Portal',
    });
  }

  // ─── Company Registration Approval Endpoints (admin one-click links) ─────────

  @Get('company/approve')
  async approveCompany(
    @Query('token') token: string,
    @Res() res: Response,
  ) {
    if (!token) return res.redirect('/login');
    try {
      await this.commandBus.execute(new ApproveCompanyCommand(token));
      return res.render('auth/approval-result', {
        title: 'Company Approved - EGMS Portal',
        approved: true,
        message: 'কোম্পানি সফলভাবে অনুমোদিত হয়েছে। তাদের একটি স্বাগত ইমেইল পাঠানো হয়েছে।',
        messageEn: 'The company has been approved and a welcome email has been sent.',
      });
    } catch (err: any) {
      return res.render('auth/approval-result', {
        title: 'Approval Failed - EGMS Portal',
        approved: false,
        error: err.message || 'Approval failed.',
        isError: true,
      });
    }
  }

  @Get('company/reject')
  async rejectCompany(
    @Query('token') token: string,
    @Res() res: Response,
  ) {
    if (!token) return res.redirect('/login');
    try {
      await this.commandBus.execute(new RejectCompanyCommand(token));
      return res.render('auth/approval-result', {
        title: 'Company Rejected - EGMS Portal',
        approved: false,
        message: 'কোম্পানি নিবন্ধন প্রত্যাখ্যাত এবং সমস্ত ডেটা মুছে ফেলা হয়েছে।',
        messageEn: 'The company registration has been rejected and all data has been permanently deleted.',
      });
    } catch (err: any) {
      return res.render('auth/approval-result', {
        title: 'Rejection Failed - EGMS Portal',
        approved: false,
        error: err.message || 'Rejection failed.',
        isError: true,
      });
    }
  }

  @Post('forgot-password')
  @UseGuards(AuthRateLimiterGuard)
  async handleForgotPassword(
    @Body('email') email: string,
    @Res() res: Response,
  ) {
    try {
      await this.commandBus.execute(new ForgotPasswordCommand(email));
      return res.redirect('/forgot-password-confirmation');
    } catch (err: any) {
      return res.render('auth/forgot-password', {
        title: 'Forgot Password - Garage Portal',
        error: err.message || 'Error processing request.',
        email,
      });
    }
  }

  @Get('forgot-password-confirmation')
  renderForgotPasswordConfirmation(@Res() res: Response) {
    return res.render('auth/forgot-password-confirmation', {
      title: 'Password Reset Requested - Garage Portal',
    });
  }

  @Get('reset-password')
  renderResetPassword(
    @Query('token') token: string,
    @Query('email') email: string,
    @Res() res: Response,
  ) {
    if (!token || !email) {
      return res.redirect('/login');
    }

    return res.render('auth/reset-password', {
      title: 'Reset Password - Garage Portal',
      token,
      email,
    });
  }

  @Post('reset-password')
  @UseGuards(AuthRateLimiterGuard)
  async handleResetPassword(
    @Body('token') token: string,
    @Body('email') email: string,
    @Body('password') password: string,
    @Res() res: Response,
  ) {
    try {
      await this.commandBus.execute(
        new ResetPasswordCommand(email, token, password),
      );
      return res.redirect('/login?message=msg.passwordResetSuccess');
    } catch (err: any) {
      return res.render('auth/reset-password', {
        title: 'Reset Password - Garage Portal',
        error: err.message || 'Failed to reset password.',
        token,
        email,
      });
    }
  }

  @Get('profile/edit')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  async renderProfileEdit(@Req() req: Request, @Res() res: Response) {
    const user = (req as any).user;
    if (!user) return res.redirect('/login');

    const company = await this.queryBus.execute(
      new GetCompanyByIdQuery(user.companyId),
    );

    return res.render('auth/edit', {
      title: 'Edit Profile - Garage Portal',
      activeNav: 'profile',
      user,
      company,
    });
  }

  @Post('profile/edit')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  async handleProfileEdit(
    @Body() body: any,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const user = (req as any).user;
    if (!user) return res.redirect('/login');

    try {
      await this.commandBus.execute(
        new UpdateCompanyCommand(
          user.companyId,
          body.name,
          body.companyName,
          body.phoneNumber,
          body.address,
          `${user.sub || user.companyId}|${user.role || 'SUPER_ADMIN'}`,
          body.unitRate !== undefined && body.unitRate !== '' ? Number(body.unitRate) : undefined,
        ),
      );
      await this.auditLogService.record({
        companyId: user.companyId,
        userId: user.sub || user.companyId,
        userName: user.name,
        userRole: user.role,
        action: 'UPDATE',
        entityType: 'COMPANY',
        entityName: body.companyName || body.name,
        details: `Updated company profile details and tariff rate (৳${body.unitRate || 'default'})`,
        req,
      });

      return res.redirect('/profile/edit?success=msg.companyUpdated');
    } catch (err: any) {
      const company = await this.queryBus.execute(
        new GetCompanyByIdQuery(user.companyId),
      ).catch(() => null);
      return res.render('auth/edit', {
        title: 'Edit Profile - EGMS Portal',
        activeNav: 'profile',
        user,
        company,
        error: err.message || 'Failed to update profile.',
      });
    }
  }

  @Get('logout')
  async handleLogout(@Req() req: Request, @Res() res: Response) {
    const user = (req as any).user;
    if (user) {
      await this.auditLogService.record({
        companyId: user.companyId,
        userId: user.sub || user.companyId,
        userName: user.name,
        userRole: user.role,
        action: 'LOGOUT',
        entityType: 'AUTH',
        details: `User ${user.name} logged out`,
        req,
      });
    }
    res.clearCookie('jwt_token');
    return res.redirect('/login?message=msg.logoutSuccess');
  }
}


