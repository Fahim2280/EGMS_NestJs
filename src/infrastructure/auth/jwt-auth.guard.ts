import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    if (err || !user) {
      const isApi = request.url.startsWith('/api') || (request.headers.accept && request.headers.accept.includes('application/json'));
      if (isApi) {
        throw err || new UnauthorizedException('Authentication token required.');
      } else {
        response.redirect('/login');
        return null;
      }
    }
    return user;
  }
}
