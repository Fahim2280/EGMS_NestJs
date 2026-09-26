import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

@Injectable()
export class AuthRateLimiterGuard implements CanActivate {
  private readonly logger = new Logger(AuthRateLimiterGuard.name);
  private readonly attempts = new Map<string, RateLimitRecord>();
  private readonly windowMs = 15 * 60 * 1000; // 15 minutes window
  private readonly maxAttempts = 15; // Max 15 attempts per 15 minutes per IP

  canActivate(context: ExecutionContext): boolean {
    const http = context.switchToHttp();
    const req = http.getRequest<Request>();
    const res = http.getResponse<Response>();

    const ip =
      req.ip ||
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.socket.remoteAddress ||
      'unknown-ip';

    const key = `auth:${ip}`;
    const now = Date.now();
    const record = this.attempts.get(key);

    if (record && record.resetTime > now) {
      if (record.count >= this.maxAttempts) {
        const remainingMinutes = Math.ceil((record.resetTime - now) / 60000);
        this.logger.warn(`🛑 Rate limit exceeded for IP: ${ip} on ${req.method} ${req.url}`);

        const lang: 'en' | 'bn' = req.cookies?.lang === 'bn' ? 'bn' : 'en';
        const msg =
          lang === 'bn'
            ? `অনেক বেশি চেষ্টা করা হয়েছে। অনুগ্রহ করে ${remainingMinutes} মিনিট পর আবার চেষ্টা করুন।`
            : `Too many attempts from this IP. Please wait ${remainingMinutes} minute(s) before trying again.`;

        const isApi =
          req.url.startsWith('/api') ||
          (req.headers.accept && req.headers.accept.includes('application/json'));

        if (isApi) {
          throw new HttpException(
            { statusCode: HttpStatus.TOO_MANY_REQUESTS, message: msg },
            HttpStatus.TOO_MANY_REQUESTS,
          );
        }

        if (req.url.includes('/register')) {
          res.status(HttpStatus.TOO_MANY_REQUESTS).render('auth/register', {
            title: 'Register Company - Garage Portal',
            error: msg,
          });
          return false;
        }

        res.status(HttpStatus.TOO_MANY_REQUESTS).render('auth/login', {
          title: 'Sign In - Garage Portal',
          error: msg,
        });
        return false;
      }
      record.count += 1;
    } else {
      this.attempts.set(key, { count: 1, resetTime: now + this.windowMs });
    }

    // Cleanup expired records periodically to keep memory bounded
    if (this.attempts.size > 2000) {
      for (const [k, v] of this.attempts.entries()) {
        if (v.resetTime <= now) this.attempts.delete(k);
      }
    }

    return true;
  }
}
