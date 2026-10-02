"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CurrentUserInterceptor = void 0;
const common_1 = require("@nestjs/common");
let CurrentUserInterceptor = class CurrentUserInterceptor {
    intercept(context, next) {
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
};
exports.CurrentUserInterceptor = CurrentUserInterceptor;
exports.CurrentUserInterceptor = CurrentUserInterceptor = __decorate([
    (0, common_1.Injectable)()
], CurrentUserInterceptor);
//# sourceMappingURL=current-user.interceptor.js.map