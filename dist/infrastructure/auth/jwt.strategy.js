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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtStrategy = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const passport_jwt_1 = require("passport-jwt");
const config_1 = require("@nestjs/config");
const index_1 = require("../../domain/index");
const cookieExtractor = (req) => {
    if (req && req.cookies) {
        return req.cookies.jwt_token || req.cookies.jwt || null;
    }
    return null;
};
let JwtStrategy = class JwtStrategy extends (0, passport_1.PassportStrategy)(passport_jwt_1.Strategy) {
    configService;
    employeeRepo;
    constructor(configService, employeeRepo) {
        super({
            jwtFromRequest: passport_jwt_1.ExtractJwt.fromExtractors([
                passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
                cookieExtractor,
            ]),
            ignoreExpiration: false,
            secretOrKey: configService.get('JWT_SECRET', 'super_secret_jwt_egms_key_2026_enterprise_secure!'),
        });
        this.configService = configService;
        this.employeeRepo = employeeRepo;
    }
    async validate(payload) {
        if (!payload || !payload.sub) {
            throw new common_1.UnauthorizedException();
        }
        if (payload.role === 'SUPER_ADMIN') {
            return {
                id: payload.sub,
                email: payload.email,
                name: payload.name || payload.fullName,
                role: 'SUPER_ADMIN',
                companyId: payload.companyId,
                companyName: payload.companyName,
                phoneNumber: payload.phoneNumber,
                nidNumber: payload.nidNumber,
                garageName: payload.garageName,
                isSuperAdmin: true,
                canCreate: true,
                canEdit: true,
                canDelete: true,
                canView: true,
                garageIds: null,
            };
        }
        const employee = await this.employeeRepo.findById(payload.sub);
        if (!employee || !employee.isActive || employee.isDeleted) {
            throw new common_1.UnauthorizedException('Employee account is inactive, suspended, or not found.');
        }
        const isSuperAdmin = employee.role === 'SUPER_ADMIN';
        return {
            id: employee.id,
            email: employee.email,
            name: employee.name,
            role: employee.role || 'GENERAL',
            companyId: employee.companyId,
            companyName: payload.companyName,
            phoneNumber: employee.phoneNumber,
            nidNumber: employee.nidNumber,
            isSuperAdmin,
            canCreate: isSuperAdmin ? true : Boolean(employee.canCreate),
            canEdit: isSuperAdmin ? true : Boolean(employee.canEdit),
            canDelete: isSuperAdmin ? true : Boolean(employee.canDelete),
            canView: isSuperAdmin ? true : Boolean(employee.canView),
            garageIds: isSuperAdmin ? null : (employee.permittedGarageIds || []),
        };
    }
};
exports.JwtStrategy = JwtStrategy;
exports.JwtStrategy = JwtStrategy = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)(index_1.EMPLOYEE_REPOSITORY_TOKEN)),
    __metadata("design:paramtypes", [config_1.ConfigService, Object])
], JwtStrategy);
//# sourceMappingURL=jwt.strategy.js.map