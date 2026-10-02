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
exports.UpdateCustomerHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const update_customer_command_1 = require("../impl/update-customer.command");
const index_1 = require("../../../domain/index");
const contact_phone_dto_1 = require("../../dtos/contact-phone.dto");
const attached_document_dto_1 = require("../../dtos/attached-document.dto");
let UpdateCustomerHandler = class UpdateCustomerHandler {
    customerRepo;
    garageRepo;
    constructor(customerRepo, garageRepo) {
        this.customerRepo = customerRepo;
        this.garageRepo = garageRepo;
    }
    async execute(command) {
        const { id, companyId, dto, actorStamp } = command;
        const customer = await this.customerRepo.getByIdAsync(id);
        if (!customer || customer.companyId !== companyId) {
            throw new common_1.NotFoundException('Customer not found.');
        }
        if (dto.garageId) {
            const garage = await this.garageRepo.getByIdAsync(dto.garageId);
            if (!garage || garage.companyId !== companyId) {
                throw new common_1.NotFoundException('The selected garage does not exist or does not belong to your company.');
            }
            if (dto.garageId !== customer.garageId && garage.isActive === false) {
                throw new common_1.BadRequestException('msg.garageSuspendedCustomerBlocked');
            }
        }
        const existingNid = await this.customerRepo.findByNid(companyId, dto.nidNumber, id);
        if (existingNid) {
            throw new common_1.ConflictException(`Another customer with NID '${dto.nidNumber}' already exists.`);
        }
        const phones = (0, contact_phone_dto_1.parsePhoneNumbersInput)(dto.phoneNumbersJson || dto.phoneNumbers, dto.mobileNumber || customer.mobileNumber);
        const primaryPhone = phones.find((p) => p.isPrimary) || phones[0];
        const mobileToUse = primaryPhone ? primaryPhone.number : (dto.mobileNumber || customer.mobileNumber);
        for (const ph of phones) {
            const existingMobile = await this.customerRepo.findByMobile(companyId, ph.number, id);
            if (existingMobile) {
                throw new common_1.ConflictException(`Another customer with phone '${ph.number}' already exists.`);
            }
        }
        if (dto.customerCode && dto.customerCode.trim()) {
            const existingCode = await this.customerRepo.findByCustomerCode(companyId, dto.customerCode.trim(), id);
            if (existingCode) {
                throw new common_1.ConflictException(`Customer ID '${dto.customerCode.trim()}' is already in use. Choose another.`);
            }
        }
        customer.updateDetails(dto.name, dto.fatherName || '', dto.motherName || '', dto.address, mobileToUse, dto.nidNumber, dto.previousUnit, dto.advanceMoney, dto.garageId, dto.customerCode?.trim() || null, actorStamp || `${companyId}|SUPER_ADMIN`, phones);
        if (dto.documentsJson !== undefined || dto.documents !== undefined) {
            const docs = (0, attached_document_dto_1.parseDocumentsInput)(dto.documentsJson || dto.documents);
            customer.setDocuments(docs);
        }
        await this.customerRepo.updateAsync(customer);
        return customer;
    }
};
exports.UpdateCustomerHandler = UpdateCustomerHandler;
exports.UpdateCustomerHandler = UpdateCustomerHandler = __decorate([
    (0, cqrs_1.CommandHandler)(update_customer_command_1.UpdateCustomerCommand),
    __param(0, (0, common_1.Inject)(index_1.CUSTOMER_REPOSITORY_TOKEN)),
    __param(1, (0, common_1.Inject)(index_1.GARAGE_REPOSITORY_TOKEN)),
    __metadata("design:paramtypes", [Object, Object])
], UpdateCustomerHandler);
//# sourceMappingURL=update-customer.handler.js.map