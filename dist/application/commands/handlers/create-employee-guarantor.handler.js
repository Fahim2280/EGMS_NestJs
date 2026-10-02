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
exports.CreateEmployeeGuarantorHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const uuid_1 = require("uuid");
const create_employee_guarantor_command_1 = require("../impl/create-employee-guarantor.command");
const index_1 = require("../../../domain/index");
const contact_phone_dto_1 = require("../../dtos/contact-phone.dto");
const attached_document_dto_1 = require("../../dtos/attached-document.dto");
let CreateEmployeeGuarantorHandler = class CreateEmployeeGuarantorHandler {
    guarantorRepo;
    employeeRepo;
    constructor(guarantorRepo, employeeRepo) {
        this.guarantorRepo = guarantorRepo;
        this.employeeRepo = employeeRepo;
    }
    async execute(command) {
        const { companyId, employeeId, dto, actorStamp } = command;
        const employee = await this.employeeRepo.getByIdAsync(employeeId);
        if (!employee || employee.companyId !== companyId) {
            throw new common_1.NotFoundException('Employee not found or does not belong to your company.');
        }
        const existing = await this.guarantorRepo.findByEmployeeAndNid(employeeId, dto.nidNumber);
        if (existing) {
            throw new common_1.ConflictException(`A guarantor with NID '${dto.nidNumber}' is already registered for this employee.`);
        }
        const phones = (0, contact_phone_dto_1.parsePhoneNumbersInput)(dto.phoneNumbersJson || dto.phoneNumbers, dto.mobileNumber);
        const primaryPhone = phones.find((p) => p.isPrimary) || phones[0];
        const mobileToUse = primaryPhone ? primaryPhone.number : dto.mobileNumber;
        const guarantorId = (0, uuid_1.v4)();
        const guarantor = index_1.Guarantor.create({
            id: guarantorId,
            employeeId,
            companyId,
            name: dto.name,
            fatherName: dto.fatherName || '',
            motherName: dto.motherName || '',
            address: dto.address,
            mobileNumber: mobileToUse,
            phoneNumbers: phones,
            documents: (0, attached_document_dto_1.parseDocumentsInput)(dto.documentsJson || dto.documents),
            nidNumber: dto.nidNumber,
            relationship: dto.relationship || '',
            createdBy: actorStamp || 'SYSTEM',
        });
        await this.guarantorRepo.addAsync(guarantor);
        return guarantor;
    }
};
exports.CreateEmployeeGuarantorHandler = CreateEmployeeGuarantorHandler;
exports.CreateEmployeeGuarantorHandler = CreateEmployeeGuarantorHandler = __decorate([
    (0, cqrs_1.CommandHandler)(create_employee_guarantor_command_1.CreateEmployeeGuarantorCommand),
    __param(0, (0, common_1.Inject)(index_1.GUARANTOR_REPOSITORY_TOKEN)),
    __param(1, (0, common_1.Inject)(index_1.EMPLOYEE_REPOSITORY_TOKEN)),
    __metadata("design:paramtypes", [Object, Object])
], CreateEmployeeGuarantorHandler);
//# sourceMappingURL=create-employee-guarantor.handler.js.map