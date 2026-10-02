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
exports.GarageProfile = void 0;
const nestjs_1 = require("@automapper/nestjs");
const core_1 = require("@automapper/core");
const common_1 = require("@nestjs/common");
const garage_entity_1 = require("../../domain/entities/garage.entity");
const garage_dto_1 = require("../dtos/garage.dto");
let GarageProfile = class GarageProfile extends nestjs_1.AutomapperProfile {
    constructor(mapper) {
        super(mapper);
    }
    get profile() {
        return (mapper) => {
            (0, core_1.createMap)(mapper, garage_entity_1.Garage, garage_dto_1.GarageResponseDto, (0, core_1.forMember)((d) => d.id, (0, core_1.mapFrom)((s) => s.id)), (0, core_1.forMember)((d) => d.garageName, (0, core_1.mapFrom)((s) => s.garageName)), (0, core_1.forMember)((d) => d.address, (0, core_1.mapFrom)((s) => s.address)), (0, core_1.forMember)((d) => d.companyId, (0, core_1.mapFrom)((s) => s.companyId)), (0, core_1.forMember)((d) => d.isActive, (0, core_1.mapFrom)((s) => s.isActive)), (0, core_1.forMember)((d) => d.createdDate, (0, core_1.mapFrom)((s) => s.createdDate)), (0, core_1.forMember)((d) => d.modifiedDate, (0, core_1.mapFrom)((s) => s.modifiedDate)), (0, core_1.forMember)((d) => d.createdBy, (0, core_1.mapFrom)((s) => s.createdBy)), (0, core_1.forMember)((d) => d.editByName, (0, core_1.mapFrom)((s) => s.editByName)), (0, core_1.forMember)((d) => d.createdAt, (0, core_1.mapFrom)((s) => s.createdDate
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
exports.GarageProfile = GarageProfile;
exports.GarageProfile = GarageProfile = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, nestjs_1.InjectMapper)()),
    __metadata("design:paramtypes", [Object])
], GarageProfile);
//# sourceMappingURL=garage.profile.js.map