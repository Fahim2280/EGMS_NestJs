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
exports.PreviewBillRequestDto = exports.CustomerBillSummaryDto = exports.ElectricBillPreviewDto = exports.ElectricBillResponseDto = exports.UpdateElectricBillDto = exports.CreateElectricBillDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class CreateElectricBillDto {
    customerId;
    date;
    currentUnit;
    rentBill;
    loan;
    clearMoney;
    unitRate;
}
exports.CreateElectricBillDto = CreateElectricBillDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Customer selection is required' }),
    __metadata("design:type", String)
], CreateElectricBillDto.prototype, "customerId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateElectricBillDto.prototype, "date", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)({}, { message: 'Current unit must be a valid number' }),
    (0, class_validator_1.Min)(0, { message: 'Current unit cannot be negative' }),
    __metadata("design:type", Number)
], CreateElectricBillDto.prototype, "currentUnit", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)({}, { message: 'Rent bill must be a valid number' }),
    (0, class_validator_1.Min)(0, { message: 'Rent bill cannot be negative' }),
    __metadata("design:type", Number)
], CreateElectricBillDto.prototype, "rentBill", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)({}, { message: 'Loan must be a valid number' }),
    (0, class_validator_1.Min)(0, { message: 'Loan cannot be negative' }),
    __metadata("design:type", Number)
], CreateElectricBillDto.prototype, "loan", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)({}, { message: 'Clear money (paid amount) must be a valid number' }),
    (0, class_validator_1.Min)(0, { message: 'Clear money cannot be negative' }),
    __metadata("design:type", Number)
], CreateElectricBillDto.prototype, "clearMoney", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)({}, { message: 'Electricity rate per unit must be a valid number' }),
    (0, class_validator_1.Min)(0.01, { message: 'Electricity rate must be greater than 0' }),
    __metadata("design:type", Number)
], CreateElectricBillDto.prototype, "unitRate", void 0);
class UpdateElectricBillDto {
    id;
    customerId;
    date;
    currentUnit;
    rentBill;
    loan;
    clearMoney;
    unitRate;
}
exports.UpdateElectricBillDto = UpdateElectricBillDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Bill ID is required' }),
    __metadata("design:type", String)
], UpdateElectricBillDto.prototype, "id", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Customer selection is required' }),
    __metadata("design:type", String)
], UpdateElectricBillDto.prototype, "customerId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateElectricBillDto.prototype, "date", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)({}, { message: 'Current unit must be a valid number' }),
    (0, class_validator_1.Min)(0, { message: 'Current unit cannot be negative' }),
    __metadata("design:type", Number)
], UpdateElectricBillDto.prototype, "currentUnit", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)({}, { message: 'Rent bill must be a valid number' }),
    (0, class_validator_1.Min)(0, { message: 'Rent bill cannot be negative' }),
    __metadata("design:type", Number)
], UpdateElectricBillDto.prototype, "rentBill", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)({}, { message: 'Loan must be a valid number' }),
    (0, class_validator_1.Min)(0, { message: 'Loan cannot be negative' }),
    __metadata("design:type", Number)
], UpdateElectricBillDto.prototype, "loan", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)({}, { message: 'Clear money must be a valid number' }),
    (0, class_validator_1.Min)(0, { message: 'Clear money cannot be negative' }),
    __metadata("design:type", Number)
], UpdateElectricBillDto.prototype, "clearMoney", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)({}, { message: 'Electricity rate per unit must be a valid number' }),
    (0, class_validator_1.Min)(0.01, { message: 'Electricity rate must be greater than 0' }),
    __metadata("design:type", Number)
], UpdateElectricBillDto.prototype, "unitRate", void 0);
class ElectricBillResponseDto {
    id;
    billNumber;
    customerId;
    customerName;
    customerCode;
    customerCId;
    garageId;
    garageName;
    companyId;
    date;
    previousUnit;
    currentUnit;
    totalUnit;
    electricBill;
    unitRate;
    previousDues;
    rentBill;
    loan;
    totalBill;
    clearMoney;
    presentDues;
    isLatestBill;
}
exports.ElectricBillResponseDto = ElectricBillResponseDto;
class ElectricBillPreviewDto {
    customerId;
    customerName;
    previousMeterReading;
    currentMeterReading;
    consumedUnits;
    electricBill;
    unitRate;
    rentBill;
    loan;
    previousDues;
    totalBill;
}
exports.ElectricBillPreviewDto = ElectricBillPreviewDto;
class CustomerBillSummaryDto {
    customerId;
    customerName;
    lastMeterReading;
    previousDues;
    lastBillDate;
    isActive;
    isGarageSuspended;
}
exports.CustomerBillSummaryDto = CustomerBillSummaryDto;
class PreviewBillRequestDto {
    customerId;
    currentMeterReading;
    rentBill;
    loan;
    unitRate;
}
exports.PreviewBillRequestDto = PreviewBillRequestDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], PreviewBillRequestDto.prototype, "customerId", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], PreviewBillRequestDto.prototype, "currentMeterReading", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], PreviewBillRequestDto.prototype, "rentBill", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], PreviewBillRequestDto.prototype, "loan", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0.01),
    __metadata("design:type", Number)
], PreviewBillRequestDto.prototype, "unitRate", void 0);
//# sourceMappingURL=electric-bill.dto.js.map