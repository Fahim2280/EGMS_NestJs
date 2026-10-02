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
exports.CustomerOrmEntity = void 0;
const typeorm_1 = require("typeorm");
const classes_1 = require("@automapper/classes");
const base_auditable_orm_entity_1 = require("./base-auditable.orm-entity");
const company_orm_entity_1 = require("./company.orm-entity");
const electric_bill_orm_entity_1 = require("./electric-bill.orm-entity");
const garage_orm_entity_1 = require("./garage.orm-entity");
const guarantor_orm_entity_1 = require("./guarantor.orm-entity");
let CustomerOrmEntity = class CustomerOrmEntity extends base_auditable_orm_entity_1.BaseAuditableOrmEntity {
    id;
    cId;
    customerCode;
    companyId;
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
    garage;
    company;
    bills;
    guarantors;
};
exports.CustomerOrmEntity = CustomerOrmEntity;
__decorate([
    (0, classes_1.AutoMap)(),
    (0, typeorm_1.PrimaryColumn)('varchar', { length: 100 }),
    __metadata("design:type", String)
], CustomerOrmEntity.prototype, "id", void 0);
__decorate([
    (0, classes_1.AutoMap)(),
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], CustomerOrmEntity.prototype, "cId", void 0);
__decorate([
    (0, classes_1.AutoMap)(() => String),
    (0, typeorm_1.Column)('varchar', { length: 50, nullable: true, default: null }),
    __metadata("design:type", Object)
], CustomerOrmEntity.prototype, "customerCode", void 0);
__decorate([
    (0, classes_1.AutoMap)(),
    (0, typeorm_1.Column)('varchar', { length: 100 }),
    __metadata("design:type", String)
], CustomerOrmEntity.prototype, "companyId", void 0);
__decorate([
    (0, classes_1.AutoMap)(),
    (0, typeorm_1.Column)({ length: 150 }),
    __metadata("design:type", String)
], CustomerOrmEntity.prototype, "name", void 0);
__decorate([
    (0, classes_1.AutoMap)(),
    (0, typeorm_1.Column)({ length: 150, default: '' }),
    __metadata("design:type", String)
], CustomerOrmEntity.prototype, "fatherName", void 0);
__decorate([
    (0, classes_1.AutoMap)(),
    (0, typeorm_1.Column)({ length: 150, default: '' }),
    __metadata("design:type", String)
], CustomerOrmEntity.prototype, "motherName", void 0);
__decorate([
    (0, classes_1.AutoMap)(),
    (0, typeorm_1.Column)('text'),
    __metadata("design:type", String)
], CustomerOrmEntity.prototype, "address", void 0);
__decorate([
    (0, classes_1.AutoMap)(),
    (0, typeorm_1.Column)({ length: 30 }),
    __metadata("design:type", String)
], CustomerOrmEntity.prototype, "mobileNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], CustomerOrmEntity.prototype, "phoneNumbers", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], CustomerOrmEntity.prototype, "documents", void 0);
__decorate([
    (0, classes_1.AutoMap)(),
    (0, typeorm_1.Column)({ length: 50 }),
    __metadata("design:type", String)
], CustomerOrmEntity.prototype, "nidNumber", void 0);
__decorate([
    (0, classes_1.AutoMap)(),
    (0, typeorm_1.Column)('decimal', { precision: 18, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], CustomerOrmEntity.prototype, "previousUnit", void 0);
__decorate([
    (0, classes_1.AutoMap)(),
    (0, typeorm_1.Column)('decimal', { precision: 18, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], CustomerOrmEntity.prototype, "advanceMoney", void 0);
__decorate([
    (0, classes_1.AutoMap)(() => String),
    (0, typeorm_1.Column)('varchar', { length: 100, nullable: true }),
    __metadata("design:type", Object)
], CustomerOrmEntity.prototype, "garageId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => garage_orm_entity_1.GarageOrmEntity, (garage) => garage.customers, {
        onDelete: 'SET NULL',
        nullable: true,
    }),
    (0, typeorm_1.JoinColumn)({ name: 'garageId' }),
    __metadata("design:type", garage_orm_entity_1.GarageOrmEntity)
], CustomerOrmEntity.prototype, "garage", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => company_orm_entity_1.CompanyOrmEntity, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'companyId' }),
    __metadata("design:type", company_orm_entity_1.CompanyOrmEntity)
], CustomerOrmEntity.prototype, "company", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => electric_bill_orm_entity_1.ElectricBillOrmEntity, (bill) => bill.customer, {
        cascade: true,
    }),
    __metadata("design:type", Array)
], CustomerOrmEntity.prototype, "bills", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => guarantor_orm_entity_1.GuarantorOrmEntity, (guarantor) => guarantor.customer, {
        cascade: true,
    }),
    __metadata("design:type", Array)
], CustomerOrmEntity.prototype, "guarantors", void 0);
exports.CustomerOrmEntity = CustomerOrmEntity = __decorate([
    (0, typeorm_1.Entity)('customers'),
    (0, typeorm_1.Index)(['companyId', 'nidNumber']),
    (0, typeorm_1.Index)(['companyId', 'mobileNumber']),
    (0, typeorm_1.Index)(['companyId', 'customerCode'])
], CustomerOrmEntity);
//# sourceMappingURL=customer.orm-entity.js.map