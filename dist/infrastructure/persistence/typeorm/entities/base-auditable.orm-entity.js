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
exports.BaseAuditableOrmEntity = void 0;
const typeorm_1 = require("typeorm");
const classes_1 = require("@automapper/classes");
class BaseAuditableOrmEntity {
    isActive;
    isDeleted;
    createdBy;
    editByName;
    deletedBy;
    createdDate;
    modifiedDate;
    deletedDate;
}
exports.BaseAuditableOrmEntity = BaseAuditableOrmEntity;
__decorate([
    (0, classes_1.AutoMap)(),
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], BaseAuditableOrmEntity.prototype, "isActive", void 0);
__decorate([
    (0, classes_1.AutoMap)(),
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], BaseAuditableOrmEntity.prototype, "isDeleted", void 0);
__decorate([
    (0, classes_1.AutoMap)(),
    (0, typeorm_1.Column)({ nullable: true, length: 150 }),
    __metadata("design:type", String)
], BaseAuditableOrmEntity.prototype, "createdBy", void 0);
__decorate([
    (0, classes_1.AutoMap)(),
    (0, typeorm_1.Column)({ nullable: true, length: 150 }),
    __metadata("design:type", String)
], BaseAuditableOrmEntity.prototype, "editByName", void 0);
__decorate([
    (0, classes_1.AutoMap)(),
    (0, typeorm_1.Column)({ nullable: true, length: 150 }),
    __metadata("design:type", String)
], BaseAuditableOrmEntity.prototype, "deletedBy", void 0);
__decorate([
    (0, classes_1.AutoMap)(),
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], BaseAuditableOrmEntity.prototype, "createdDate", void 0);
__decorate([
    (0, classes_1.AutoMap)(),
    (0, typeorm_1.UpdateDateColumn)({ nullable: true }),
    __metadata("design:type", Date)
], BaseAuditableOrmEntity.prototype, "modifiedDate", void 0);
__decorate([
    (0, classes_1.AutoMap)(),
    (0, typeorm_1.Column)({ nullable: true, type: 'datetime' }),
    __metadata("design:type", Date)
], BaseAuditableOrmEntity.prototype, "deletedDate", void 0);
//# sourceMappingURL=base-auditable.orm-entity.js.map