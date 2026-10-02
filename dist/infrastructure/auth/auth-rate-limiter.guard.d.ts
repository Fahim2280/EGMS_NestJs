import { CanActivate, ExecutionContext } from '@nestjs/common';
export declare class AuthRateLimiterGuard implements CanActivate {
    private readonly logger;
    private readonly attempts;
    private readonly windowMs;
    private readonly maxAttempts;
    canActivate(context: ExecutionContext): boolean;
}
