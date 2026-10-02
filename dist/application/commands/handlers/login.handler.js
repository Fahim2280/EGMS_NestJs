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
exports.LoginHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = require("bcryptjs");
const login_command_1 = require("../impl/login.command");
const index_1 = require("../../../domain/index");
let LoginHandler = class LoginHandler {
    companyRepo;
    employeeRepo;
    garageRepo;
    jwtService;
    constructor(companyRepo, employeeRepo, garageRepo, jwtService) {
        this.companyRepo = companyRepo;
        this.employeeRepo = employeeRepo;
        this.garageRepo = garageRepo;
        this.jwtService = jwtService;
    }
    async execute(command) {
        const { email, password } = command.dto;
        const normalizedEmail = email.trim().toLowerCase();
        const company = await this.companyRepo.findByEmail(normalizedEmail);
        if (company) {
            if (company.registrationStatus === 'PENDING') {
                throw new common_1.ForbiddenException('আপনার কোম্পানি নিবন্ধন এখনো অনুমোদিত হয়নি। অনুগ্রহ করে অ্যাডমিনের অনুমোদনের জন্য অপেক্ষা করুন। (Your company registration is pending admin approval.)');
            }
            if (company.registrationStatus === 'REJECTED') {
                throw new common_1.ForbiddenException('আপনার কোম্পানি নিবন্ধন প্রত্যাখ্যাত হয়েছে। (Your company registration has been rejected.)');
            }
            const isMatch = await bcrypt.compare(password, company.password);
            if (isMatch) {
                const garages = await this.garageRepo.findByCompanyId(company.id);
                const payload = {
                    id: company.id,
                    sub: company.id,
                    email: company.email,
                    name: company.name,
                    role: company.role || 'SUPER_ADMIN',
                    companyId: company.id,
                    companyName: company.companyName,
                    phoneNumber: company.phoneNumber,
                    garageName: garages.length > 0 ? garages[0].garageName : undefined,
                };
                const accessToken = this.jwtService.sign(payload);
                return {
                    success: true,
                    message: 'Company Super Admin authenticated successfully',
                    data: {
                        user: payload,
                        accessToken,
                    },
                };
            }
        }
        const employee = await this.employeeRepo.findByEmail(normalizedEmail);
        if (employee) {
            const isMatch = await bcrypt.compare(password, employee.password);
            if (isMatch) {
                if (!employee.isActive || employee.isDeleted) {
                    throw new common_1.UnauthorizedException('Your employee account has been deactivated or suspended. Please contact your company administrator.');
                }
                const companyOfEmployee = await this.companyRepo.findById(employee.companyId);
                const payload = {
                    id: employee.id,
                    sub: employee.id,
                    email: employee.email,
                    name: employee.name,
                    role: employee.role || 'GENERAL',
                    companyId: employee.companyId,
                    companyName: companyOfEmployee?.companyName || 'Associated Company',
                    phoneNumber: employee.phoneNumber,
                    nidNumber: employee.nidNumber,
                    isSuperAdmin: employee.role === 'SUPER_ADMIN',
                    canCreate: Boolean(employee.canCreate),
                    canEdit: Boolean(employee.canEdit),
                    canDelete: Boolean(employee.canDelete),
                    canView: Boolean(employee.canView),
                    garageIds: employee.permittedGarageIds || [],
                };
                const accessToken = this.jwtService.sign(payload);
                return {
                    success: true,
                    message: 'Employee authenticated successfully',
                    data: {
                        user: payload,
                        accessToken,
                    },
                };
            }
        }
        throw new common_1.UnauthorizedException('Invalid email or password');
    }
};
exports.LoginHandler = LoginHandler;
exports.LoginHandler = LoginHandler = __decorate([
    (0, cqrs_1.CommandHandler)(login_command_1.LoginCommand),
    __param(0, (0, common_1.Inject)(index_1.COMPANY_REPOSITORY_TOKEN)),
    __param(1, (0, common_1.Inject)(index_1.EMPLOYEE_REPOSITORY_TOKEN)),
    __param(2, (0, common_1.Inject)(index_1.GARAGE_REPOSITORY_TOKEN)),
    __metadata("design:paramtypes", [Object, Object, Object, jwt_1.JwtService])
], LoginHandler);
//# sourceMappingURL=login.handler.js.map