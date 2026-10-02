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
exports.ResetPasswordHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const bcrypt = require("bcryptjs");
const reset_password_command_1 = require("../impl/reset-password.command");
const index_1 = require("../../../domain/index");
let ResetPasswordHandler = class ResetPasswordHandler {
    companyRepo;
    tokenRepo;
    constructor(companyRepo, tokenRepo) {
        this.companyRepo = companyRepo;
        this.tokenRepo = tokenRepo;
    }
    async execute(command) {
        const { email, token, newPassword } = command;
        const normalizedEmail = email.trim().toLowerCase();
        const resetToken = await this.tokenRepo.findByTokenAndEmail(token, normalizedEmail);
        if (!resetToken || !resetToken.isValid()) {
            throw new common_1.BadRequestException('This password reset link is invalid or has expired.');
        }
        const company = await this.companyRepo.findByEmail(normalizedEmail);
        if (!company) {
            throw new common_1.NotFoundException('Account not found.');
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        company.updatePassword(hashedPassword, `${company.id}|PASSWORD_RESET`);
        await this.companyRepo.updateAsync(company);
        resetToken.markUsed();
        await this.tokenRepo.save(resetToken);
        return true;
    }
};
exports.ResetPasswordHandler = ResetPasswordHandler;
exports.ResetPasswordHandler = ResetPasswordHandler = __decorate([
    (0, cqrs_1.CommandHandler)(reset_password_command_1.ResetPasswordCommand),
    __param(0, (0, common_1.Inject)(index_1.COMPANY_REPOSITORY_TOKEN)),
    __param(1, (0, common_1.Inject)(index_1.PASSWORD_RESET_TOKEN_REPOSITORY_TOKEN)),
    __metadata("design:paramtypes", [Object, Object])
], ResetPasswordHandler);
//# sourceMappingURL=reset-password.handler.js.map