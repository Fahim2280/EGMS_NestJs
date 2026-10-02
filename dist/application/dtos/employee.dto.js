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
exports.EmployeeResponseDto = exports.UpdateEmployeeDto = exports.CreateEmployeeDto = void 0;
const class_validator_1 = require("class-validator");
const classes_1 = require("@automapper/classes");
class CreateEmployeeDto {
    companyId;
    name;
    address;
    email;
    password;
    phoneNumber;
    phoneNumbers;
    phoneNumbersJson;
    documents;
    documentsJson;
    nidNumber;
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
exports.CreateEmployeeDto = CreateEmployeeDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateEmployeeDto.prototype, "companyId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Employee name is required' }),
    (0, class_validator_1.MinLength)(2, { message: 'Name must be at least 2 characters' }),
    __metadata("design:type", String)
], CreateEmployeeDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Address is required' }),
    (0, class_validator_1.MinLength)(3, { message: 'Address must be at least 3 characters' }),
    __metadata("design:type", String)
], CreateEmployeeDto.prototype, "address", void 0);
__decorate([
    (0, class_validator_1.IsEmail)({}, { message: 'A valid email address is required' }),
    __metadata("design:type", String)
], CreateEmployeeDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(6, { message: 'Password must be at least 6 characters' }),
    __metadata("design:type", String)
], CreateEmployeeDto.prototype, "password", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateEmployeeDto.prototype, "phoneNumber", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateEmployeeDto.prototype, "phoneNumbers", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateEmployeeDto.prototype, "phoneNumbersJson", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateEmployeeDto.prototype, "documents", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateEmployeeDto.prototype, "documentsJson", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'NID Number is required' }),
    (0, class_validator_1.MinLength)(5, { message: 'NID Number must be at least 5 characters' }),
    __metadata("design:type", String)
], CreateEmployeeDto.prototype, "nidNumber", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateEmployeeDto.prototype, "hasGuarantor", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateEmployeeDto.prototype, "guarantorsJson", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateEmployeeDto.prototype, "guarantorName", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateEmployeeDto.prototype, "guarantorRelationship", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateEmployeeDto.prototype, "guarantorMobileNumber", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateEmployeeDto.prototype, "guarantorPhoneNumbersJson", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateEmployeeDto.prototype, "guarantorNidNumber", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateEmployeeDto.prototype, "guarantorFatherName", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateEmployeeDto.prototype, "guarantorMotherName", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateEmployeeDto.prototype, "guarantorAddress", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateEmployeeDto.prototype, "guarantorDocumentType", void 0);
class UpdateEmployeeDto {
    name;
    address;
    phoneNumber;
    phoneNumbers;
    phoneNumbersJson;
    documents;
    documentsJson;
    nidNumber;
    removeAvatar;
}
exports.UpdateEmployeeDto = UpdateEmployeeDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MinLength)(2),
    __metadata("design:type", String)
], UpdateEmployeeDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MinLength)(3),
    __metadata("design:type", String)
], UpdateEmployeeDto.prototype, "address", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateEmployeeDto.prototype, "phoneNumber", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], UpdateEmployeeDto.prototype, "phoneNumbers", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateEmployeeDto.prototype, "phoneNumbersJson", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], UpdateEmployeeDto.prototype, "documents", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateEmployeeDto.prototype, "documentsJson", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MinLength)(5),
    __metadata("design:type", String)
], UpdateEmployeeDto.prototype, "nidNumber", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateEmployeeDto.prototype, "removeAvatar", void 0);
class EmployeeResponseDto {
    id;
    companyId;
    name;
    address;
    email;
    phoneNumber;
    phoneNumbers;
    documents;
    role;
    nidNumber;
    isActive;
    canCreate;
    canEdit;
    canDelete;
    canView;
    permittedGarageIds;
    permittedGarages;
    createdAt;
    updatedAt;
    createdDate;
    modifiedDate;
    createdBy;
    editByName;
    companyName;
}
exports.EmployeeResponseDto = EmployeeResponseDto;
__decorate([
    (0, classes_1.AutoMap)(),
    __metadata("design:type", String)
], EmployeeResponseDto.prototype, "id", void 0);
__decorate([
    (0, classes_1.AutoMap)(),
    __metadata("design:type", String)
], EmployeeResponseDto.prototype, "companyId", void 0);
__decorate([
    (0, classes_1.AutoMap)(),
    __metadata("design:type", String)
], EmployeeResponseDto.prototype, "name", void 0);
__decorate([
    (0, classes_1.AutoMap)(),
    __metadata("design:type", String)
], EmployeeResponseDto.prototype, "address", void 0);
__decorate([
    (0, classes_1.AutoMap)(),
    __metadata("design:type", String)
], EmployeeResponseDto.prototype, "email", void 0);
__decorate([
    (0, classes_1.AutoMap)(),
    __metadata("design:type", String)
], EmployeeResponseDto.prototype, "phoneNumber", void 0);
__decorate([
    (0, classes_1.AutoMap)(),
    __metadata("design:type", String)
], EmployeeResponseDto.prototype, "role", void 0);
__decorate([
    (0, classes_1.AutoMap)(),
    __metadata("design:type", String)
], EmployeeResponseDto.prototype, "nidNumber", void 0);
__decorate([
    (0, classes_1.AutoMap)(),
    __metadata("design:type", Boolean)
], EmployeeResponseDto.prototype, "isActive", void 0);
__decorate([
    (0, classes_1.AutoMap)(),
    __metadata("design:type", Boolean)
], EmployeeResponseDto.prototype, "canCreate", void 0);
__decorate([
    (0, classes_1.AutoMap)(),
    __metadata("design:type", Boolean)
], EmployeeResponseDto.prototype, "canEdit", void 0);
__decorate([
    (0, classes_1.AutoMap)(),
    __metadata("design:type", Boolean)
], EmployeeResponseDto.prototype, "canDelete", void 0);
__decorate([
    (0, classes_1.AutoMap)(),
    __metadata("design:type", Boolean)
], EmployeeResponseDto.prototype, "canView", void 0);
__decorate([
    (0, classes_1.AutoMap)(),
    __metadata("design:type", String)
], EmployeeResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, classes_1.AutoMap)(),
    __metadata("design:type", String)
], EmployeeResponseDto.prototype, "updatedAt", void 0);
//# sourceMappingURL=employee.dto.js.map