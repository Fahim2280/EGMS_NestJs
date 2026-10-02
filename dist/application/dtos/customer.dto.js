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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerDashboardItemDto = exports.CustomerResponseDto = exports.UpdateCustomerDto = exports.CreateCustomerDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class CreateCustomerDto {
    name;
    fatherName;
    motherName;
    address;
    mobileNumber;
    phoneNumbers;
    phoneNumbersJson;
    documents;
    documentsJson;
    nidNumber;
    previousUnit;
    advanceMoney;
    garageId;
    customerCode;
    removeAvatar;
    hasGuarantor;
    guarantorsJson;
    guarantorName;
    guarantorRelationship;
    guarantorMobileNumber;
    guarantorPhoneNumbersJson;
    guarantorNidNumber;
    guarantorFatherName;
    guarantorMotherName;
    guarantorAddress;
    guarantorDocumentType;
}
exports.CreateCustomerDto = CreateCustomerDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Customer name is required' }),
    (0, class_validator_1.MinLength)(2, { message: 'Name must be at least 2 characters' }),
    __metadata("design:type", String)
], CreateCustomerDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateCustomerDto.prototype, "fatherName", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateCustomerDto.prototype, "motherName", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Address is required' }),
    __metadata("design:type", String)
], CreateCustomerDto.prototype, "address", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateCustomerDto.prototype, "mobileNumber", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateCustomerDto.prototype, "phoneNumbers", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateCustomerDto.prototype, "phoneNumbersJson", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateCustomerDto.prototype, "documents", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateCustomerDto.prototype, "documentsJson", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'NID number is required' }),
    (0, class_validator_1.MinLength)(6, { message: 'NID number must be at least 6 characters' }),
    __metadata("design:type", String)
], CreateCustomerDto.prototype, "nidNumber", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)({}, { message: 'Previous unit must be a valid number' }),
    (0, class_validator_1.Min)(0, { message: 'Previous unit cannot be negative' }),
    __metadata("design:type", Number)
], CreateCustomerDto.prototype, "previousUnit", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)({}, { message: 'Advance money must be a valid number' }),
    __metadata("design:type", Number)
], CreateCustomerDto.prototype, "advanceMoney", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Assigned garage is required. Each customer must belong to one garage.' }),
    __metadata("design:type", String)
], CreateCustomerDto.prototype, "garageId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateCustomerDto.prototype, "customerCode", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateCustomerDto.prototype, "removeAvatar", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateCustomerDto.prototype, "hasGuarantor", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateCustomerDto.prototype, "guarantorsJson", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateCustomerDto.prototype, "guarantorName", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateCustomerDto.prototype, "guarantorRelationship", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateCustomerDto.prototype, "guarantorMobileNumber", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateCustomerDto.prototype, "guarantorPhoneNumbersJson", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateCustomerDto.prototype, "guarantorNidNumber", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateCustomerDto.prototype, "guarantorFatherName", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateCustomerDto.prototype, "guarantorMotherName", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateCustomerDto.prototype, "guarantorAddress", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateCustomerDto.prototype, "guarantorDocumentType", void 0);
class UpdateCustomerDto extends CreateCustomerDto {
}
exports.UpdateCustomerDto = UpdateCustomerDto;
class CustomerResponseDto {
    id;
    cId;
    companyId;
    customerCode;
    name;
    fatherName;
    motherName;
    address;
    mobileNumber;
    phoneNumbers;
    documents;
    nidNumber;
    previousUnit;
    advanceMoney;
    garageId;
    garageName;
    isActive;
    isGarageSuspended;
    createdDate;
    bills;
    guarantors;
}
exports.CustomerResponseDto = CustomerResponseDto;
class CustomerDashboardItemDto {
    id;
    cId;
    customerCode;
    name;
    mobileNumber;
    presentDues;
    advanceMoney;
    garageId;
    garageName;
    isActive;
    isGarageSuspended;
    lastBillDate;
    hasBills;
}
exports.CustomerDashboardItemDto = CustomerDashboardItemDto;
//# sourceMappingURL=customer.dto.js.map