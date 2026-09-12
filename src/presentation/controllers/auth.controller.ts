import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { Response, Request } from 'express';
import { LoginDto } from '@application/dtos/auth.dto';
import { RegisterCompanyDto } from '@application/dtos/company.dto';
import { LoginCommand } from '@application/commands/impl/login.command';
import { RegisterCompanyCommand } from '@application/commands/impl/register-company.command';

@Controller()
export class AuthController {
  constructor(private readonly commandBus: CommandBus) {}

  @Get('login')
  renderLogin(@Req() req: Request, @Res() res: Response) {
    if ((req as any).user) {
      return res.redirect('/');
    }
    return res.render('auth/login', {
      title: 'Sign In - Garage Portal',
    });
  }

  @Post('login')
  async handleLogin(@Body() dto: LoginDto, @Res() res: Response) {
    try {
      const result = await this.commandBus.execute(new LoginCommand(dto));
      const token = result.data.accessToken;

      res.cookie('jwt_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        sameSite: 'lax',
      });

      return res.redirect('/');
    } catch (err: any) {
      return res.render('auth/login', {
        title: 'Sign In - Garage Portal',
        error: err.message || 'Invalid credentials',
        email: dto.email,
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
    });
  }

  @Post('register')
  async handleRegister(@Body() dto: RegisterCompanyDto, @Res() res: Response) {
    try {
      await this.commandBus.execute(new RegisterCompanyCommand(dto));
      const loginResult = await this.commandBus.execute(
        new LoginCommand({ email: dto.email, password: dto.password }),
      );
      const token = loginResult.data.accessToken;

      res.cookie('jwt_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        sameSite: 'lax',
      });

      return res.redirect('/');
    } catch (err: any) {
      return res.render('auth/register', {
        title: 'Register Company - Garage Portal',
        error: err.message || 'Registration failed',
        formData: dto,
      });
    }
  }


  @Get('logout')
  handleLogout(@Res() res: Response) {
    res.clearCookie('jwt_token');
    return res.redirect('/login');
  }
}
