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
exports.CompanyResponseDto = exports.UpdateCompanyDto = exports.RegisterCompanyDto = void 0;
const class_validator_1 = require("class-validator");
const classes_1 = require("@automapper/classes");
class RegisterCompanyDto {
    name;
    companyName;
    email;
    password;
    confirmPassword;
    phoneNumber;
    address;
    initialGarageName;
    initialGarageAddress;
}
exports.RegisterCompanyDto = RegisterCompanyDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Owner / Contact name is required' }),
    (0, class_validator_1.MinLength)(2, { message: 'Name must be at least 2 characters' }),
    __metadata("design:type", String)
], RegisterCompanyDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Company name is required' }),
    (0, class_validator_1.MinLength)(2, { message: 'Company name must be at least 2 characters' }),
    __metadata("design:type", String)
], RegisterCompanyDto.prototype, "companyName", void 0);
__decorate([
    (0, class_validator_1.IsEmail)({}, { message: 'A valid email address is required' }),
    __metadata("design:type", String)
], RegisterCompanyDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(6, { message: 'Password must be at least 6 characters' }),
    __metadata("design:type", String)
], RegisterCompanyDto.prototype, "password", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], RegisterCompanyDto.prototype, "confirmPassword", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Phone number is required' }),
    (0, class_validator_1.MinLength)(6, { message: 'Phone number must be at least 6 characters' }),
    __metadata("design:type", String)
], RegisterCompanyDto.prototype, "phoneNumber", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Address is required' }),
    __metadata("design:type", String)
], RegisterCompanyDto.prototype, "address", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], RegisterCompanyDto.prototype, "initialGarageName", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], RegisterCompanyDto.prototype, "initialGarageAddress", void 0);
class UpdateCompanyDto {
    name;
    companyName;
    phoneNumber;
    address;
}
exports.UpdateCompanyDto = UpdateCompanyDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MinLength)(2),
    __metadata("design:type", String)
], UpdateCompanyDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MinLength)(2),
    __metadata("design:type", String)
], UpdateCompanyDto.prototype, "companyName", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateCompanyDto.prototype, "phoneNumber", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateCompanyDto.prototype, "address", void 0);
class CompanyResponseDto {
    id;
    name;
    companyName;
    email;
    phoneNumber;
    role;
    address;
    isActive;
    createdAt;
    updatedAt;
    createdDate;
    modifiedDate;
    createdBy;
    editByName;
    garages;
    employeeCount;
}
exports.CompanyResponseDto = CompanyResponseDto;
__decorate([
    (0, classes_1.AutoMap)(),
    __metadata("design:type", String)
], CompanyResponseDto.prototype, "id", void 0);
__decorate([
    (0, classes_1.AutoMap)(),
    __metadata("design:type", String)
], CompanyResponseDto.prototype, "name", void 0);
__decorate([
    (0, classes_1.AutoMap)(),
    __metadata("design:type", String)
], CompanyResponseDto.prototype, "companyName", void 0);
__decorate([
    (0, classes_1.AutoMap)(),
    __metadata("design:type", String)
], CompanyResponseDto.prototype, "email", void 0);
__decorate([
    (0, classes_1.AutoMap)(),
    __metadata("design:type", String)
], CompanyResponseDto.prototype, "phoneNumber", void 0);
__decorate([
    (0, classes_1.AutoMap)(),
    __metadata("design:type", String)
], CompanyResponseDto.prototype, "role", void 0);
__decorate([
    (0, classes_1.AutoMap)(),
    __metadata("design:type", String)
], CompanyResponseDto.prototype, "address", void 0);
__decorate([
    (0, classes_1.AutoMap)(),
    __metadata("design:type", Boolean)
], CompanyResponseDto.prototype, "isActive", void 0);
__decorate([
    (0, classes_1.AutoMap)(),
    __metadata("design:type", String)
], CompanyResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, classes_1.AutoMap)(),
    __metadata("design:type", String)
], CompanyResponseDto.prototype, "updatedAt", void 0);
//# sourceMappingURL=company.dto.js.map