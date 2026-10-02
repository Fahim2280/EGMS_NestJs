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
exports.GuarantorResponseDto = exports.UpdateGuarantorDto = exports.CreateGuarantorDto = void 0;
const class_validator_1 = require("class-validator");
class CreateGuarantorDto {
    name;
    fatherName;
    motherName;
    mobileNumber;
    phoneNumbers;
    phoneNumbersJson;
    documents;
    documentsJson;
    documentType;
    nidNumber;
    address;
    relationship;
}
exports.CreateGuarantorDto = CreateGuarantorDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Guarantor name is required.' }),
    (0, class_validator_1.MinLength)(2, { message: 'Name must be at least 2 characters.' }),
    __metadata("design:type", String)
], CreateGuarantorDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateGuarantorDto.prototype, "fatherName", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateGuarantorDto.prototype, "motherName", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateGuarantorDto.prototype, "mobileNumber", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateGuarantorDto.prototype, "phoneNumbers", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateGuarantorDto.prototype, "phoneNumbersJson", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateGuarantorDto.prototype, "documents", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateGuarantorDto.prototype, "documentsJson", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateGuarantorDto.prototype, "documentType", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'NID number is required.' }),
    (0, class_validator_1.MinLength)(6, { message: 'NID number must be at least 6 characters.' }),
    __metadata("design:type", String)
], CreateGuarantorDto.prototype, "nidNumber", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Address is required.' }),
    __metadata("design:type", String)
], CreateGuarantorDto.prototype, "address", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateGuarantorDto.prototype, "relationship", void 0);
class UpdateGuarantorDto extends CreateGuarantorDto {
}
exports.UpdateGuarantorDto = UpdateGuarantorDto;
class GuarantorResponseDto {
    id;
    customerId;
    employeeId;
    companyId;
    name;
    fatherName;
    motherName;
    address;
    mobileNumber;
    phoneNumbers;
    documents;
    nidNumber;
    relationship;
    createdDate;
}
exports.GuarantorResponseDto = GuarantorResponseDto;
//# sourceMappingURL=guarantor.dto.js.map