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
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const auth_dto_1 = require("../../application/dtos/auth.dto");
const company_dto_1 = require("../../application/dtos/company.dto");
const login_command_1 = require("../../application/commands/impl/login.command");
const register_company_command_1 = require("../../application/commands/impl/register-company.command");
const forgot_password_command_1 = require("../../application/commands/impl/forgot-password.command");
const reset_password_command_1 = require("../../application/commands/impl/reset-password.command");
const update_company_command_1 = require("../../application/commands/impl/update-company.command");
const approve_company_command_1 = require("../../application/commands/impl/approve-company.command");
const reject_company_command_1 = require("../../application/commands/impl/reject-company.command");
const get_company_by_id_query_1 = require("../../application/queries/impl/get-company-by-id.query");
const jwt_auth_guard_1 = require("../../infrastructure/auth/jwt-auth.guard");
const roles_guard_1 = require("../../infrastructure/auth/roles.guard");
const roles_decorator_1 = require("../../infrastructure/auth/roles.decorator");
const audit_log_service_1 = require("../../application/services/audit-log.service");
const auth_rate_limiter_guard_1 = require("../../infrastructure/auth/auth-rate-limiter.guard");
const email_service_1 = require("../../infrastructure/email/email.service");
let AuthController = class AuthController {
    commandBus;
    queryBus;
    auditLogService;
    emailService;
    constructor(commandBus, queryBus, auditLogService, emailService) {
        this.commandBus = commandBus;
        this.queryBus = queryBus;
        this.auditLogService = auditLogService;
        this.emailService = emailService;
    }
    renderLogin(message, req, res) {
        if (req.user) {
            return res.redirect('/');
        }
        return res.render('auth/login', {
            title: 'Sign In - Garage Portal',
            successMessage: message,
            activeNav: 'login',
        });
    }
    async handleLogin(dto, req, res) {
        try {
            const result = await this.commandBus.execute(new login_command_1.LoginCommand(dto));
            const token = result.data.accessToken;
            res.cookie('jwt_token', token, {
                httpOnly: true,
                secure: req.secure || process.env.HTTPS === 'true' || process.env.NODE_ENV === 'production',
                maxAge: 7 * 24 * 60 * 60 * 1000,
                sameSite: 'lax',
            });
            await this.auditLogService.record({
                companyId: result.data.user.companyId,
                userId: result.data.user.id,
                userName: result.data.user.name,
                userRole: result.data.user.role,
                action: 'LOGIN',
                entityType: 'AUTH',
                details: `User ${result.data.user.name} (${result.data.user.email}) signed in`,
                req,
            });
            return res.redirect('/');
        }
        catch (err) {
            return res.render('auth/login', {
                title: 'Sign In - Garage Portal',
                error: err.message || 'Invalid credentials',
                email: dto.email,
                activeNav: 'login',
            });
        }
    }
    renderRegister(req, res) {
        if (req.user) {
            return res.redirect('/');
        }
        return res.render('auth/register', {
            title: 'Register Company - Garage Portal',
            activeNav: 'register',
        });
    }
    async handleRegister(dto, req, res) {
        if (dto.confirmPassword !== undefined && dto.confirmPassword !== dto.password) {
            const isBn = req.lang === 'bn';
            return res.render('auth/register', {
                title: 'Register Company - Garage Portal',
                error: isBn ? 'পাসওয়ার্ড দুটি মেলেনি' : 'Passwords do not match',
                formData: dto,
                activeNav: 'register',
            });
        }
        try {
            await this.commandBus.execute(new register_company_command_1.RegisterCompanyCommand(dto));
            return res.render('auth/register-pending', {
                title: 'Registration Submitted - Garage Portal',
                companyName: dto.companyName,
                email: dto.email,
                activeNav: 'register',
            });
        }
        catch (err) {
            return res.render('auth/register', {
                title: 'Register Company - Garage Portal',
                error: err.message || 'Registration failed',
                formData: dto,
                activeNav: 'register',
            });
        }
    }
    renderForgotPassword(req, res) {
        return res.render('auth/forgot-password', {
            title: 'Forgot Password - Garage Portal',
        });
    }
    async approveCompany(token, res) {
        if (!token)
            return res.redirect('/login');
        try {
            await this.commandBus.execute(new approve_company_command_1.ApproveCompanyCommand(token));
            return res.render('auth/approval-result', {
                title: 'Company Approved - EGMS Portal',
                approved: true,
                message: 'কোম্পানি সফলভাবে অনুমোদিত হয়েছে। তাদের একটি স্বাগত ইমেইল পাঠানো হয়েছে।',
                messageEn: 'The company has been approved and a welcome email has been sent.',
            });
        }
        catch (err) {
            return res.render('auth/approval-result', {
                title: 'Approval Failed - EGMS Portal',
                approved: false,
                error: err.message || 'Approval failed.',
                isError: true,
            });
        }
    }
    async rejectCompany(token, res) {
        if (!token)
            return res.redirect('/login');
        try {
            await this.commandBus.execute(new reject_company_command_1.RejectCompanyCommand(token));
            return res.render('auth/approval-result', {
                title: 'Company Rejected - EGMS Portal',
                approved: false,
                message: 'কোম্পানি নিবন্ধন প্রত্যাখ্যাত এবং সমস্ত ডেটা মুছে ফেলা হয়েছে।',
                messageEn: 'The company registration has been rejected and all data has been permanently deleted.',
            });
        }
        catch (err) {
            return res.render('auth/approval-result', {
                title: 'Rejection Failed - EGMS Portal',
                approved: false,
                error: err.message || 'Rejection failed.',
                isError: true,
            });
        }
    }
    async handleForgotPassword(email, res) {
        try {
            await this.commandBus.execute(new forgot_password_command_1.ForgotPasswordCommand(email));
            return res.redirect('/forgot-password-confirmation');
        }
        catch (err) {
            return res.render('auth/forgot-password', {
                title: 'Forgot Password - Garage Portal',
                error: err.message || 'Error processing request.',
                email,
            });
        }
    }
    renderForgotPasswordConfirmation(res) {
        return res.render('auth/forgot-password-confirmation', {
            title: 'Password Reset Requested - Garage Portal',
        });
    }
    renderResetPassword(token, email, res) {
        if (!token || !email) {
            return res.redirect('/login');
        }
        return res.render('auth/reset-password', {
            title: 'Reset Password - Garage Portal',
            token,
            email,
        });
    }
    async handleResetPassword(token, email, password, res) {
        try {
            await this.commandBus.execute(new reset_password_command_1.ResetPasswordCommand(email, token, password));
            return res.redirect('/login?message=msg.passwordResetSuccess');
        }
        catch (err) {
            return res.render('auth/reset-password', {
                title: 'Reset Password - Garage Portal',
                error: err.message || 'Failed to reset password.',
                token,
                email,
            });
        }
    }
    async renderProfileEdit(req, res) {
        const user = req.user;
        if (!user)
            return res.redirect('/login');
        const company = await this.queryBus.execute(new get_company_by_id_query_1.GetCompanyByIdQuery(user.companyId));
        return res.render('auth/edit', {
            title: 'Edit Profile - Garage Portal',
            activeNav: 'profile',
            user,
            company,
        });
    }
    async handleProfileEdit(body, req, res) {
        const user = req.user;
        if (!user)
            return res.redirect('/login');
        try {
            await this.commandBus.execute(new update_company_command_1.UpdateCompanyCommand(user.companyId, body.name, body.companyName, body.phoneNumber, body.address, `${user.sub || user.companyId}|${user.role || 'SUPER_ADMIN'}`, body.unitRate !== undefined && body.unitRate !== '' ? Number(body.unitRate) : undefined));
            await this.auditLogService.record({
                companyId: user.companyId,
                userId: user.sub || user.companyId,
                userName: user.name,
                userRole: user.role,
                action: 'UPDATE',
                entityType: 'COMPANY',
                entityName: body.companyName || body.name,
                details: `Updated company profile details and tariff rate (৳${body.unitRate || 'default'})`,
                req,
            });
            return res.redirect('/profile/edit?success=msg.companyUpdated');
        }
        catch (err) {
            const company = await this.queryBus.execute(new get_company_by_id_query_1.GetCompanyByIdQuery(user.companyId)).catch(() => null);
            return res.render('auth/edit', {
                title: 'Edit Profile - EGMS Portal',
                activeNav: 'profile',
                user,
                company,
                error: err.message || 'Failed to update profile.',
            });
        }
    }
    async handleLogout(req, res) {
        const user = req.user;
        if (user) {
            await this.auditLogService.record({
                companyId: user.companyId,
                userId: user.sub || user.companyId,
                userName: user.name,
                userRole: user.role,
                action: 'LOGOUT',
                entityType: 'AUTH',
                details: `User ${user.name} logged out`,
                req,
            });
        }
        res.clearCookie('jwt_token');
        return res.redirect('/login?message=msg.logoutSuccess');
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Get)('login'),
    __param(0, (0, common_1.Query)('message')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "renderLogin", null);
__decorate([
    (0, common_1.Post)('login'),
    (0, common_1.UseGuards)(auth_rate_limiter_guard_1.AuthRateLimiterGuard),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.LoginDto, Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "handleLogin", null);
__decorate([
    (0, common_1.Get)('register'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "renderRegister", null);
__decorate([
    (0, common_1.Post)('register'),
    (0, common_1.UseGuards)(auth_rate_limiter_guard_1.AuthRateLimiterGuard),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [company_dto_1.RegisterCompanyDto, Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "handleRegister", null);
__decorate([
    (0, common_1.Get)('forgot-password'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "renderForgotPassword", null);
__decorate([
    (0, common_1.Get)('company/approve'),
    __param(0, (0, common_1.Query)('token')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "approveCompany", null);
__decorate([
    (0, common_1.Get)('company/reject'),
    __param(0, (0, common_1.Query)('token')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "rejectCompany", null);
__decorate([
    (0, common_1.Post)('forgot-password'),
    (0, common_1.UseGuards)(auth_rate_limiter_guard_1.AuthRateLimiterGuard),
    __param(0, (0, common_1.Body)('email')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "handleForgotPassword", null);
__decorate([
    (0, common_1.Get)('forgot-password-confirmation'),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "renderForgotPasswordConfirmation", null);
__decorate([
    (0, common_1.Get)('reset-password'),
    __param(0, (0, common_1.Query)('token')),
    __param(1, (0, common_1.Query)('email')),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "renderResetPassword", null);
__decorate([
    (0, common_1.Post)('reset-password'),
    (0, common_1.UseGuards)(auth_rate_limiter_guard_1.AuthRateLimiterGuard),
    __param(0, (0, common_1.Body)('token')),
    __param(1, (0, common_1.Body)('email')),
    __param(2, (0, common_1.Body)('password')),
    __param(3, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "handleResetPassword", null);
__decorate([
    (0, common_1.Get)('profile/edit'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('SUPER_ADMIN'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "renderProfileEdit", null);
__decorate([
    (0, common_1.Post)('profile/edit'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('SUPER_ADMIN'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "handleProfileEdit", null);
__decorate([
    (0, common_1.Get)('logout'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "handleLogout", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [cqrs_1.CommandBus,
        cqrs_1.QueryBus,
        audit_log_service_1.AuditLogService,
        email_service_1.EmailService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map