"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var AuthRateLimiterGuard_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthRateLimiterGuard = void 0;
const common_1 = require("@nestjs/common");
let AuthRateLimiterGuard = AuthRateLimiterGuard_1 = class AuthRateLimiterGuard {
    logger = new common_1.Logger(AuthRateLimiterGuard_1.name);
    attempts = new Map();
    windowMs = 15 * 60 * 1000;
    maxAttempts = 15;
    canActivate(context) {
        const http = context.switchToHttp();
        const req = http.getRequest();
        const res = http.getResponse();
        const ip = req.ip ||
            req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
            req.socket.remoteAddress ||
            'unknown-ip';
        const key = `auth:${ip}`;
        const now = Date.now();
        const record = this.attempts.get(key);
        if (record && record.resetTime > now) {
            if (record.count >= this.maxAttempts) {
                const remainingMinutes = Math.ceil((record.resetTime - now) / 60000);
                this.logger.warn(`🛑 Rate limit exceeded for IP: ${ip} on ${req.method} ${req.url}`);
                const lang = req.cookies?.lang === 'bn' ? 'bn' : 'en';
                const msg = lang === 'bn'
                    ? `অনেক বেশি চেষ্টা করা হয়েছে। অনুগ্রহ করে ${remainingMinutes} মিনিট পর আবার চেষ্টা করুন।`
                    : `Too many attempts from this IP. Please wait ${remainingMinutes} minute(s) before trying again.`;
                const isApi = req.url.startsWith('/api') ||
                    (req.headers.accept && req.headers.accept.includes('application/json'));
                if (isApi) {
                    throw new common_1.HttpException({ statusCode: common_1.HttpStatus.TOO_MANY_REQUESTS, message: msg }, common_1.HttpStatus.TOO_MANY_REQUESTS);
                }
                if (req.url.includes('/register')) {
                    res.status(common_1.HttpStatus.TOO_MANY_REQUESTS).render('auth/register', {
                        title: 'Register Company - Garage Portal',
                        error: msg,
                    });
                    return false;
                }
                res.status(common_1.HttpStatus.TOO_MANY_REQUESTS).render('auth/login', {
                    title: 'Sign In - Garage Portal',
                    error: msg,
                });
                return false;
            }
            record.count += 1;
        }
        else {
            this.attempts.set(key, { count: 1, resetTime: now + this.windowMs });
        }
        if (this.attempts.size > 2000) {
            for (const [k, v] of this.attempts.entries()) {
                if (v.resetTime <= now)
                    this.attempts.delete(k);
            }
        }
        return true;
    }
};
exports.AuthRateLimiterGuard = AuthRateLimiterGuard;
exports.AuthRateLimiterGuard = AuthRateLimiterGuard = AuthRateLimiterGuard_1 = __decorate([
    (0, common_1.Injectable)()
], AuthRateLimiterGuard);
//# sourceMappingURL=auth-rate-limiter.guard.js.map