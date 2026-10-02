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
exports.DeleteGuarantorHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const delete_guarantor_command_1 = require("../impl/delete-guarantor.command");
const index_1 = require("../../../domain/index");
let DeleteGuarantorHandler = class DeleteGuarantorHandler {
    guarantorRepo;
    constructor(guarantorRepo) {
        this.guarantorRepo = guarantorRepo;
    }
    async execute(command) {
        const { companyId, customerId, guarantorId, actorStamp } = command;
        const guarantor = await this.guarantorRepo.getByIdAsync(guarantorId);
        if (!guarantor ||
            guarantor.companyId !== companyId ||
            guarantor.customerId !== customerId ||
            guarantor.isDeleted) {
            throw new common_1.NotFoundException('Guarantor not found.');
        }
        return this.guarantorRepo.softDeleteAsync(guarantorId, actorStamp);
    }
};
exports.DeleteGuarantorHandler = DeleteGuarantorHandler;
exports.DeleteGuarantorHandler = DeleteGuarantorHandler = __decorate([
    (0, cqrs_1.CommandHandler)(delete_guarantor_command_1.DeleteGuarantorCommand),
    __param(0, (0, common_1.Inject)(index_1.GUARANTOR_REPOSITORY_TOKEN)),
    __metadata("design:paramtypes", [Object])
], DeleteGuarantorHandler);
//# sourceMappingURL=delete-guarantor.handler.js.map