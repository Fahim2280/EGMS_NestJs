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
exports.CreateCustomerHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const uuid_1 = require("uuid");
const create_customer_command_1 = require("../impl/create-customer.command");
const index_1 = require("../../../domain/index");
const contact_phone_dto_1 = require("../../dtos/contact-phone.dto");
const attached_document_dto_1 = require("../../dtos/attached-document.dto");
let CreateCustomerHandler = class CreateCustomerHandler {
    customerRepo;
    garageRepo;
    constructor(customerRepo, garageRepo) {
        this.customerRepo = customerRepo;
        this.garageRepo = garageRepo;
    }
    async execute(command) {
        const { companyId, dto, actorStamp } = command;
        if (dto.garageId) {
            const garage = await this.garageRepo.getByIdAsync(dto.garageId);
            if (!garage || garage.companyId !== companyId) {
                throw new common_1.NotFoundException('The selected garage does not exist or does not belong to your company.');
            }
            if (garage.isActive === false) {
                throw new common_1.BadRequestException('msg.garageSuspendedCustomerBlocked');
            }
        }
        const existingNid = await this.customerRepo.findByNid(companyId, dto.nidNumber);
        if (existingNid) {
            throw new common_1.ConflictException(`A customer with NID '${dto.nidNumber}' already exists.`);
        }
        const phones = (0, contact_phone_dto_1.parsePhoneNumbersInput)(dto.phoneNumbersJson || dto.phoneNumbers, dto.mobileNumber);
        const primaryPhone = phones.find((p) => p.isPrimary) || phones[0];
        const mobileToUse = primaryPhone ? primaryPhone.number : dto.mobileNumber;
        for (const ph of phones) {
            const existingMobile = await this.customerRepo.findByMobile(companyId, ph.number);
            if (existingMobile) {
                throw new common_1.ConflictException(`A customer with phone number '${ph.number}' already exists.`);
            }
        }
        if (dto.customerCode && dto.customerCode.trim()) {
            const existingCode = await this.customerRepo.findByCustomerCode(companyId, dto.customerCode.trim());
            if (existingCode) {
                throw new common_1.ConflictException(`Customer ID '${dto.customerCode.trim()}' is already in use. Choose another.`);
            }
        }
        const customerCount = await this.customerRepo.countByCompanyId(companyId);
        const customerId = (0, uuid_1.v4)();
        const customer = index_1.Customer.create({
            id: customerId,
            cId: customerCount + 1,
            companyId,
            customerCode: dto.customerCode?.trim() || null,
            name: dto.name,
            fatherName: dto.fatherName || '',
            motherName: dto.motherName || '',
            address: dto.address,
            mobileNumber: mobileToUse,
            phoneNumbers: phones,
            documents: (0, attached_document_dto_1.parseDocumentsInput)(dto.documentsJson || dto.documents),
            nidNumber: dto.nidNumber,
            previousUnit: dto.previousUnit,
            advanceMoney: dto.advanceMoney,
            garageId: dto.garageId,
            createdBy: actorStamp || `${companyId}|SUPER_ADMIN`,
        });
        await this.customerRepo.save(customer);
        return customer;
    }
};
exports.CreateCustomerHandler = CreateCustomerHandler;
exports.CreateCustomerHandler = CreateCustomerHandler = __decorate([
    (0, cqrs_1.CommandHandler)(create_customer_command_1.CreateCustomerCommand),
    __param(0, (0, common_1.Inject)(index_1.CUSTOMER_REPOSITORY_TOKEN)),
    __param(1, (0, common_1.Inject)(index_1.GARAGE_REPOSITORY_TOKEN)),
    __metadata("design:paramtypes", [Object, Object])
], CreateCustomerHandler);
//# sourceMappingURL=create-customer.handler.js.map