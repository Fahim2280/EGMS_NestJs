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
exports.RegisterCompanyHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const uuid_1 = require("uuid");
const config_1 = require("@nestjs/config");
const register_company_command_1 = require("../impl/register-company.command");
const index_1 = require("../../../domain/index");
const email_service_1 = require("../../../infrastructure/email/email.service");
let RegisterCompanyHandler = class RegisterCompanyHandler {
    companyRepo;
    garageRepo;
    approvalTokenRepo;
    emailService;
    config;
    constructor(companyRepo, garageRepo, approvalTokenRepo, emailService, config) {
        this.companyRepo = companyRepo;
        this.garageRepo = garageRepo;
        this.approvalTokenRepo = approvalTokenRepo;
        this.emailService = emailService;
        this.config = config;
    }
    async execute(command) {
        const { dto } = command;
        const existing = await this.companyRepo.findByEmail(dto.email);
        if (existing) {
            throw new common_1.ConflictException(`Company with email '${dto.email}' already exists.`);
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(dto.password, salt);
        const companyId = (0, uuid_1.v4)();
        const company = index_1.Company.create({
            id: companyId,
            name: dto.name,
            companyName: dto.companyName,
            email: dto.email,
            password: hashedPassword,
            phoneNumber: dto.phoneNumber,
            address: dto.address,
            role: 'SUPER_ADMIN',
            createdBy: `${companyId}|SUPER_ADMIN`,
        });
        await this.companyRepo.save(company);
        if (dto.initialGarageName && dto.initialGarageAddress) {
            const garage = index_1.Garage.create({
                id: (0, uuid_1.v4)(),
                companyId: companyId,
                garageName: dto.initialGarageName,
                address: dto.initialGarageAddress,
                createdBy: `${companyId}|SUPER_ADMIN`,
            });
            await this.garageRepo.save(garage);
        }
        const rawToken = crypto.randomBytes(32).toString('hex');
        const expiryHours = Number(this.config.get('APPROVAL_TOKEN_EXPIRY_HOURS') || 48);
        const approvalToken = new index_1.CompanyApprovalToken({
            id: (0, uuid_1.v4)(),
            companyId: companyId,
            token: rawToken,
            expiresAt: new Date(Date.now() + expiryHours * 60 * 60 * 1000),
        });
        await this.approvalTokenRepo.save(approvalToken);
        const appUrl = this.config.get('APP_URL') || 'http://localhost:3000';
        const adminEmail = this.config.get('ADMIN_APPROVAL_EMAIL') || 'kfahim2280@gmail.com';
        const approveUrl = `${appUrl}/company/approve?token=${rawToken}`;
        const rejectUrl = `${appUrl}/company/reject?token=${rawToken}`;
        this.emailService
            .sendCompanyApprovalRequestEmail(adminEmail, dto.companyName, dto.email, approveUrl, rejectUrl)
            .catch(() => { });
        return company;
    }
};
exports.RegisterCompanyHandler = RegisterCompanyHandler;
exports.RegisterCompanyHandler = RegisterCompanyHandler = __decorate([
    (0, cqrs_1.CommandHandler)(register_company_command_1.RegisterCompanyCommand),
    __param(0, (0, common_1.Inject)(index_1.COMPANY_REPOSITORY_TOKEN)),
    __param(1, (0, common_1.Inject)(index_1.GARAGE_REPOSITORY_TOKEN)),
    __param(2, (0, common_1.Inject)(index_1.COMPANY_APPROVAL_TOKEN_REPOSITORY_TOKEN)),
    __metadata("design:paramtypes", [Object, Object, Object, email_service_1.EmailService,
        config_1.ConfigService])
], RegisterCompanyHandler);
//# sourceMappingURL=register-company.handler.js.map