import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class CurrentUserInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const res = context.switchToHttp().getResponse();
    if (req.user && res && res.locals) {
      res.locals.currentUser = req.user;
      res.locals.isSuperAdmin =
        req.user.role === 'SUPER_ADMIN' ||
        req.user.isSuperAdmin === true ||
        req.user.role?.toUpperCase() === 'SUPER_ADMIN';
    }
    return next.handle();
  }
}
