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
exports.CompanyProfile = void 0;
const nestjs_1 = require("@automapper/nestjs");
const core_1 = require("@automapper/core");
const common_1 = require("@nestjs/common");
const company_entity_1 = require("../../domain/entities/company.entity");
const company_dto_1 = require("../dtos/company.dto");
let CompanyProfile = class CompanyProfile extends nestjs_1.AutomapperProfile {
    constructor(mapper) {
        super(mapper);
    }
    get profile() {
        return (mapper) => {
            (0, core_1.createMap)(mapper, company_entity_1.Company, company_dto_1.CompanyResponseDto, (0, core_1.forMember)((d) => d.id, (0, core_1.mapFrom)((s) => s.id)), (0, core_1.forMember)((d) => d.name, (0, core_1.mapFrom)((s) => s.name)), (0, core_1.forMember)((d) => d.companyName, (0, core_1.mapFrom)((s) => s.companyName)), (0, core_1.forMember)((d) => d.email, (0, core_1.mapFrom)((s) => s.email)), (0, core_1.forMember)((d) => d.phoneNumber, (0, core_1.mapFrom)((s) => s.phoneNumber)), (0, core_1.forMember)((d) => d.role, (0, core_1.mapFrom)((s) => s.role)), (0, core_1.forMember)((d) => d.address, (0, core_1.mapFrom)((s) => s.address)), (0, core_1.forMember)((d) => d.isActive, (0, core_1.mapFrom)((s) => s.isActive)), (0, core_1.forMember)((d) => d.createdDate, (0, core_1.mapFrom)((s) => s.createdDate)), (0, core_1.forMember)((d) => d.modifiedDate, (0, core_1.mapFrom)((s) => s.modifiedDate)), (0, core_1.forMember)((d) => d.createdBy, (0, core_1.mapFrom)((s) => s.createdBy)), (0, core_1.forMember)((d) => d.editByName, (0, core_1.mapFrom)((s) => s.editByName)), (0, core_1.forMember)((d) => d.createdAt, (0, core_1.mapFrom)((s) => s.createdDate
                ? new Date(s.createdDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                })
                : '')), (0, core_1.forMember)((d) => d.updatedAt, (0, core_1.mapFrom)((s) => s.modifiedDate || s.createdDate
                ? new Date(s.modifiedDate || s.createdDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                })
                : '')));
        };
    }
};
exports.CompanyProfile = CompanyProfile;
exports.CompanyProfile = CompanyProfile = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, nestjs_1.InjectMapper)()),
    __metadata("design:paramtypes", [Object])
], CompanyProfile);
//# sourceMappingURL=company.profile.js.map