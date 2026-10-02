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
var ForgotPasswordHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ForgotPasswordHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const uuid_1 = require("uuid");
const crypto = require("crypto");
const forgot_password_command_1 = require("../impl/forgot-password.command");
const index_1 = require("../../../domain/index");
const email_service_1 = require("../../../infrastructure/email/email.service");
let ForgotPasswordHandler = ForgotPasswordHandler_1 = class ForgotPasswordHandler {
    companyRepo;
    tokenRepo;
    emailService;
    configService;
    logger = new common_1.Logger(ForgotPasswordHandler_1.name);
    constructor(companyRepo, tokenRepo, emailService, configService) {
        this.companyRepo = companyRepo;
        this.tokenRepo = tokenRepo;
        this.emailService = emailService;
        this.configService = configService;
    }
    async execute(command) {
        const { email } = command;
        const normalizedEmail = email.trim().toLowerCase();
        const company = await this.companyRepo.findByEmail(normalizedEmail);
        if (!company) {
            return { success: true };
        }
        await this.tokenRepo.invalidateExistingTokens(normalizedEmail);
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
        const resetToken = new index_1.PasswordResetToken({
            id: (0, uuid_1.v4)(),
            email: normalizedEmail,
            token,
            expiresAt,
        });
        await this.tokenRepo.save(resetToken);
        const appUrl = this.configService.get('APP_URL') ||
            process.env.APP_URL ||
            'https://localhost:3000';
        const resetLink = `${appUrl}/reset-password?token=${token}&email=${encodeURIComponent(normalizedEmail)}`;
        await this.emailService.sendPasswordResetEmail(normalizedEmail, resetLink);
        return { success: true, token };
    }
};
exports.ForgotPasswordHandler = ForgotPasswordHandler;
exports.ForgotPasswordHandler = ForgotPasswordHandler = ForgotPasswordHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(forgot_password_command_1.ForgotPasswordCommand),
    __param(0, (0, common_1.Inject)(index_1.COMPANY_REPOSITORY_TOKEN)),
    __param(1, (0, common_1.Inject)(index_1.PASSWORD_RESET_TOKEN_REPOSITORY_TOKEN)),
    __metadata("design:paramtypes", [Object, Object, email_service_1.EmailService,
        config_1.ConfigService])
], ForgotPasswordHandler);
//# sourceMappingURL=forgot-password.handler.js.map