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
exports.UpdateEmployeeGuarantorHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const update_employee_guarantor_command_1 = require("../impl/update-employee-guarantor.command");
const index_1 = require("../../../domain/index");
const contact_phone_dto_1 = require("../../dtos/contact-phone.dto");
const attached_document_dto_1 = require("../../dtos/attached-document.dto");
let UpdateEmployeeGuarantorHandler = class UpdateEmployeeGuarantorHandler {
    guarantorRepo;
    constructor(guarantorRepo) {
        this.guarantorRepo = guarantorRepo;
    }
    async execute(command) {
        const { companyId, employeeId, guarantorId, dto, actorStamp } = command;
        const guarantor = await this.guarantorRepo.getByIdAsync(guarantorId);
        if (!guarantor ||
            guarantor.companyId !== companyId ||
            guarantor.employeeId !== employeeId ||
            guarantor.isDeleted) {
            throw new common_1.NotFoundException('Employee guarantor not found.');
        }
        const existing = await this.guarantorRepo.findByEmployeeAndNid(employeeId, dto.nidNumber, guarantorId);
        if (existing) {
            throw new common_1.ConflictException(`Another guarantor with NID '${dto.nidNumber}' already exists for this employee.`);
        }
        const phones = (0, contact_phone_dto_1.parsePhoneNumbersInput)(dto.phoneNumbersJson || dto.phoneNumbers, dto.mobileNumber || guarantor.mobileNumber);
        const primaryPhone = phones.find((p) => p.isPrimary) || phones[0];
        const mobileToUse = primaryPhone ? primaryPhone.number : (dto.mobileNumber || guarantor.mobileNumber);
        guarantor.updateDetails(dto.name, dto.fatherName || '', dto.motherName || '', dto.address, mobileToUse, dto.nidNumber, dto.relationship || '', actorStamp, phones);
        if (dto.documentsJson !== undefined || dto.documents !== undefined) {
            const docs = (0, attached_document_dto_1.parseDocumentsInput)(dto.documentsJson || dto.documents);
            guarantor.setDocuments(docs);
        }
        await this.guarantorRepo.updateAsync(guarantor);
        return guarantor;
    }
};
exports.UpdateEmployeeGuarantorHandler = UpdateEmployeeGuarantorHandler;
exports.UpdateEmployeeGuarantorHandler = UpdateEmployeeGuarantorHandler = __decorate([
    (0, cqrs_1.CommandHandler)(update_employee_guarantor_command_1.UpdateEmployeeGuarantorCommand),
    __param(0, (0, common_1.Inject)(index_1.GUARANTOR_REPOSITORY_TOKEN)),
    __metadata("design:paramtypes", [Object])
], UpdateEmployeeGuarantorHandler);
//# sourceMappingURL=update-employee-guarantor.handler.js.map