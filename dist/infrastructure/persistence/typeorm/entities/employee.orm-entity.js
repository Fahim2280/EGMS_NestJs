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
exports.EmployeeOrmEntity = void 0;
const typeorm_1 = require("typeorm");
const classes_1 = require("@automapper/classes");
const base_auditable_orm_entity_1 = require("./base-auditable.orm-entity");
const company_orm_entity_1 = require("./company.orm-entity");
const garage_orm_entity_1 = require("./garage.orm-entity");
const guarantor_orm_entity_1 = require("./guarantor.orm-entity");
let EmployeeOrmEntity = class EmployeeOrmEntity extends base_auditable_orm_entity_1.BaseAuditableOrmEntity {
    id;
    companyId;
    name;
    address;
    email;
    password;
    phoneNumber;
    phoneNumbers;
    documents;
    role;
    nidNumber;
    canCreate;
    canEdit;
    canDelete;
    canView;
    company;
    permittedGarages;
    guarantors;
};
exports.EmployeeOrmEntity = EmployeeOrmEntity;
__decorate([
    (0, classes_1.AutoMap)(),
    (0, typeorm_1.PrimaryColumn)('varchar', { length: 100 }),
    __metadata("design:type", String)
], EmployeeOrmEntity.prototype, "id", void 0);
__decorate([
    (0, classes_1.AutoMap)(),
    (0, typeorm_1.Column)('varchar', { length: 100 }),
    __metadata("design:type", String)
], EmployeeOrmEntity.prototype, "companyId", void 0);
__decorate([
    (0, classes_1.AutoMap)(),
    (0, typeorm_1.Column)({ length: 100 }),
    __metadata("design:type", String)
], EmployeeOrmEntity.prototype, "name", void 0);
__decorate([
    (0, classes_1.AutoMap)(),
    (0, typeorm_1.Column)('text'),
    __metadata("design:type", String)
], EmployeeOrmEntity.prototype, "address", void 0);
__decorate([
    (0, classes_1.AutoMap)(),
    (0, typeorm_1.Index)({ unique: true }),
    (0, typeorm_1.Column)({ length: 150 }),
    __metadata("design:type", String)
], EmployeeOrmEntity.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255 }),
    __metadata("design:type", String)
], EmployeeOrmEntity.prototype, "password", void 0);
__decorate([
    (0, classes_1.AutoMap)(),
    (0, typeorm_1.Column)({ length: 30 }),
    __metadata("design:type", String)
], EmployeeOrmEntity.prototype, "phoneNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], EmployeeOrmEntity.prototype, "phoneNumbers", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], EmployeeOrmEntity.prototype, "documents", void 0);
__decorate([
    (0, classes_1.AutoMap)(),
    (0, typeorm_1.Column)({ type: 'varchar', length: 20, default: 'GENERAL' }),
    __metadata("design:type", String)
], EmployeeOrmEntity.prototype, "role", void 0);
__decorate([
    (0, classes_1.AutoMap)(),
    (0, typeorm_1.Index)({ unique: true }),
    (0, typeorm_1.Column)({ length: 50 }),
    __metadata("design:type", String)
], EmployeeOrmEntity.prototype, "nidNumber", void 0);
__decorate([
    (0, classes_1.AutoMap)(),
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], EmployeeOrmEntity.prototype, "canCreate", void 0);
__decorate([
    (0, classes_1.AutoMap)(),
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], EmployeeOrmEntity.prototype, "canEdit", void 0);
__decorate([
    (0, classes_1.AutoMap)(),
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], EmployeeOrmEntity.prototype, "canDelete", void 0);
__decorate([
    (0, classes_1.AutoMap)(),
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], EmployeeOrmEntity.prototype, "canView", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => company_orm_entity_1.CompanyOrmEntity, (company) => company.employees, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'companyId' }),
    __metadata("design:type", company_orm_entity_1.CompanyOrmEntity)
], EmployeeOrmEntity.prototype, "company", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => garage_orm_entity_1.GarageOrmEntity, (garage) => garage.employees, {
        cascade: true,
    }),
    (0, typeorm_1.JoinTable)({
        name: 'employee_garages',
        joinColumn: { name: 'employeeId', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'garageId', referencedColumnName: 'id' },
    }),
    __metadata("design:type", Array)
], EmployeeOrmEntity.prototype, "permittedGarages", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => guarantor_orm_entity_1.GuarantorOrmEntity, (guarantor) => guarantor.employee, {
        cascade: true,
    }),
    __metadata("design:type", Array)
], EmployeeOrmEntity.prototype, "guarantors", void 0);
exports.EmployeeOrmEntity = EmployeeOrmEntity = __decorate([
    (0, typeorm_1.Entity)('employees')
], EmployeeOrmEntity);
//# sourceMappingURL=employee.orm-entity.js.map