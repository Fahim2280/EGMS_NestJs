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
exports.RejectCompanyHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const reject_company_command_1 = require("../impl/reject-company.command");
const index_1 = require("../../../domain/index");
let RejectCompanyHandler = class RejectCompanyHandler {
    approvalTokenRepo;
    companyRepo;
    constructor(approvalTokenRepo, companyRepo) {
        this.approvalTokenRepo = approvalTokenRepo;
        this.companyRepo = companyRepo;
    }
    async execute(command) {
        const { token } = command;
        const approvalToken = await this.approvalTokenRepo.findByToken(token);
        if (!approvalToken) {
            throw new common_1.NotFoundException('Invalid approval token.');
        }
        if (!approvalToken.isValid()) {
            throw new common_1.BadRequestException('This rejection link has already been used or has expired.');
        }
        const company = await this.companyRepo.findById(approvalToken.companyId);
        if (!company) {
            await this.approvalTokenRepo.markUsed(approvalToken.id);
            return;
        }
        await this.approvalTokenRepo.markUsed(approvalToken.id);
        await this.companyRepo.delete(company.id);
    }
};
exports.RejectCompanyHandler = RejectCompanyHandler;
exports.RejectCompanyHandler = RejectCompanyHandler = __decorate([
    (0, cqrs_1.CommandHandler)(reject_company_command_1.RejectCompanyCommand),
    __param(0, (0, common_1.Inject)(index_1.COMPANY_APPROVAL_TOKEN_REPOSITORY_TOKEN)),
    __param(1, (0, common_1.Inject)(index_1.COMPANY_REPOSITORY_TOKEN)),
    __metadata("design:paramtypes", [Object, Object])
], RejectCompanyHandler);
//# sourceMappingURL=reject-company.handler.js.map