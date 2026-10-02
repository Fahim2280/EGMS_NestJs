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
exports.GarageDashboardDto = exports.GarageMetricsDto = exports.GarageResponseDto = exports.UpdateGarageDto = exports.CreateGarageDto = void 0;
const class_validator_1 = require("class-validator");
const classes_1 = require("@automapper/classes");
class CreateGarageDto {
    garageName;
    address;
    companyId;
}
exports.CreateGarageDto = CreateGarageDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Garage name is required' }),
    (0, class_validator_1.MinLength)(2, { message: 'Garage name must be at least 2 characters' }),
    __metadata("design:type", String)
], CreateGarageDto.prototype, "garageName", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Garage address is required' }),
    (0, class_validator_1.MinLength)(3, { message: 'Address must be at least 3 characters' }),
    __metadata("design:type", String)
], CreateGarageDto.prototype, "address", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateGarageDto.prototype, "companyId", void 0);
class UpdateGarageDto {
    garageName;
    address;
}
exports.UpdateGarageDto = UpdateGarageDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MinLength)(2),
    __metadata("design:type", String)
], UpdateGarageDto.prototype, "garageName", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MinLength)(3),
    __metadata("design:type", String)
], UpdateGarageDto.prototype, "address", void 0);
class GarageResponseDto {
    id;
    garageName;
    address;
    companyId;
    isActive;
    createdAt;
    updatedAt;
    createdDate;
    modifiedDate;
    createdBy;
    editByName;
    companyName;
    customerCount;
}
exports.GarageResponseDto = GarageResponseDto;
__decorate([
    (0, classes_1.AutoMap)(),
    __metadata("design:type", String)
], GarageResponseDto.prototype, "id", void 0);
__decorate([
    (0, classes_1.AutoMap)(),
    __metadata("design:type", String)
], GarageResponseDto.prototype, "garageName", void 0);
__decorate([
    (0, classes_1.AutoMap)(),
    __metadata("design:type", String)
], GarageResponseDto.prototype, "address", void 0);
__decorate([
    (0, classes_1.AutoMap)(),
    __metadata("design:type", String)
], GarageResponseDto.prototype, "companyId", void 0);
__decorate([
    (0, classes_1.AutoMap)(),
    __metadata("design:type", Boolean)
], GarageResponseDto.prototype, "isActive", void 0);
__decorate([
    (0, classes_1.AutoMap)(),
    __metadata("design:type", String)
], GarageResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, classes_1.AutoMap)(),
    __metadata("design:type", String)
], GarageResponseDto.prototype, "updatedAt", void 0);
class GarageMetricsDto {
    totalCustomers;
    totalUnitsConsumed;
    totalElectricAmount;
    totalBilledAmount;
    totalCollectedRevenue;
    totalOutstandingDues;
    averageUnitsPerCustomer;
}
exports.GarageMetricsDto = GarageMetricsDto;
class GarageDashboardDto {
    garage;
    metrics;
    customers;
    recentBills;
    totalFilteredBillsCount;
    fromDate;
    toDate;
}
exports.GarageDashboardDto = GarageDashboardDto;
//# sourceMappingURL=garage.dto.js.map