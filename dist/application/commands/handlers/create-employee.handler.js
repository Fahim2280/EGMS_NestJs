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
exports.CreateEmployeeHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const bcrypt = require("bcryptjs");
const uuid_1 = require("uuid");
const create_employee_command_1 = require("../impl/create-employee.command");
const index_1 = require("../../../domain/index");
const contact_phone_dto_1 = require("../../dtos/contact-phone.dto");
const attached_document_dto_1 = require("../../dtos/attached-document.dto");
let CreateEmployeeHandler = class CreateEmployeeHandler {
    employeeRepo;
    companyRepo;
    constructor(employeeRepo, companyRepo) {
        this.employeeRepo = employeeRepo;
        this.companyRepo = companyRepo;
    }
    async execute(command) {
        const { companyId, dto } = command;
        const company = await this.companyRepo.findById(companyId);
        if (!company) {
            throw new common_1.NotFoundException(`Company with ID '${companyId}' was not found.`);
        }
        const existingEmail = await this.employeeRepo.findByEmail(dto.email);
        if (existingEmail) {
            throw new common_1.ConflictException(`Employee with email '${dto.email}' already exists.`);
        }
        const existingNid = await this.employeeRepo.findByNid(dto.nidNumber);
        if (existingNid) {
            throw new common_1.ConflictException(`Employee with NID '${dto.nidNumber}' already exists.`);
        }
        const phones = (0, contact_phone_dto_1.parsePhoneNumbersInput)(dto.phoneNumbersJson || dto.phoneNumbers, dto.phoneNumber);
        const primaryPhone = phones.find((p) => p.isPrimary) || phones[0];
        const phoneToUse = primaryPhone ? primaryPhone.number : dto.phoneNumber;
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(dto.password, salt);
        const employee = index_1.Employee.create({
            id: (0, uuid_1.v4)(),
            companyId: company.id,
            name: dto.name,
            address: dto.address,
            email: dto.email,
            password: hashedPassword,
            phoneNumber: phoneToUse,
            phoneNumbers: phones,
            documents: (0, attached_document_dto_1.parseDocumentsInput)(dto.documentsJson || dto.documents),
            role: 'GENERAL',
            nidNumber: dto.nidNumber,
            createdBy: `${company.id}|SUPER_ADMIN`,
        });
        await this.employeeRepo.save(employee);
        return employee;
    }
};
exports.CreateEmployeeHandler = CreateEmployeeHandler;
exports.CreateEmployeeHandler = CreateEmployeeHandler = __decorate([
    (0, cqrs_1.CommandHandler)(create_employee_command_1.CreateEmployeeCommand),
    __param(0, (0, common_1.Inject)(index_1.EMPLOYEE_REPOSITORY_TOKEN)),
    __param(1, (0, common_1.Inject)(index_1.COMPANY_REPOSITORY_TOKEN)),
    __metadata("design:paramtypes", [Object, Object])
], CreateEmployeeHandler);
//# sourceMappingURL=create-employee.handler.js.map