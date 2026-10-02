"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PermissionsGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const permissions_decorator_1 = require("./permissions.decorator");
let PermissionsGuard = class PermissionsGuard {
    reflector;
    constructor(reflector) {
        this.reflector = reflector;
    }
    canActivate(context) {
        const requiredPermissions = this.reflector.getAllAndOverride(permissions_decorator_1.PERMISSIONS_KEY, [context.getHandler(), context.getClass()]);
        if (!requiredPermissions || requiredPermissions.length === 0) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const response = context.switchToHttp().getResponse();
        const user = request.user;
        if (!user) {
            const isApi = request.url.startsWith('/api') ||
                (request.headers.accept && request.headers.accept.includes('application/json'));
            if (!isApi) {
                response.redirect('/login');
                return false;
            }
            response.status(401).json({ message: 'Authentication required.' });
            return false;
        }
        if (user.role === 'SUPER_ADMIN' || user.isSuperAdmin) {
            return true;
        }
        const hasAll = requiredPermissions.every((perm) => Boolean(user[perm]));
        if (!hasAll) {
            const isApi = request.url.startsWith('/api') ||
                (request.headers.accept && request.headers.accept.includes('application/json'));
            if (!isApi) {
                response.redirect('/403');
                return false;
            }
            response.status(403).json({
                message: `Insufficient permissions. Required: [${requiredPermissions.join(', ')}]`,
            });
            return false;
        }
        return true;
    }
};
exports.PermissionsGuard = PermissionsGuard;
exports.PermissionsGuard = PermissionsGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector])
], PermissionsGuard);
//# sourceMappingURL=permissions.guard.js.map