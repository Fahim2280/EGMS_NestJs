import { Controller, Get, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';

@Controller()
export class ErrorController {
  @Get('403')
  render403(@Req() req: Request, @Res() res: Response) {
    return res.render('errors/403', {
      title: 'Access Denied - EGMS Portal',
      layout: false, // Use standalone layout for error pages
    });
  }
}
