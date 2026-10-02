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
exports.GuarantorOrmEntity = void 0;
const typeorm_1 = require("typeorm");
const classes_1 = require("@automapper/classes");
const base_auditable_orm_entity_1 = require("./base-auditable.orm-entity");
const company_orm_entity_1 = require("./company.orm-entity");
const customer_orm_entity_1 = require("./customer.orm-entity");
const employee_orm_entity_1 = require("./employee.orm-entity");
let GuarantorOrmEntity = class GuarantorOrmEntity extends base_auditable_orm_entity_1.BaseAuditableOrmEntity {
    id;
    customerId;
    employeeId;
    companyId;
    name;
    fatherName;
    motherName;
    mobileNumber;
    phoneNumbers;
    documents;
    nidNumber;
    address;
    relationship;
    customer;
    employee;
    company;
};
exports.GuarantorOrmEntity = GuarantorOrmEntity;
__decorate([
    (0, classes_1.AutoMap)(),
    (0, typeorm_1.PrimaryColumn)('varchar', { length: 100 }),
    __metadata("design:type", String)
], GuarantorOrmEntity.prototype, "id", void 0);
__decorate([
    (0, classes_1.AutoMap)(() => String),
    (0, typeorm_1.Column)('varchar', { length: 100, nullable: true }),
    __metadata("design:type", Object)
], GuarantorOrmEntity.prototype, "customerId", void 0);
__decorate([
    (0, classes_1.AutoMap)(() => String),
    (0, typeorm_1.Column)('varchar', { length: 100, nullable: true }),
    __metadata("design:type", Object)
], GuarantorOrmEntity.prototype, "employeeId", void 0);
__decorate([
    (0, classes_1.AutoMap)(),
    (0, typeorm_1.Column)('varchar', { length: 100 }),
    __metadata("design:type", String)
], GuarantorOrmEntity.prototype, "companyId", void 0);
__decorate([
    (0, classes_1.AutoMap)(),
    (0, typeorm_1.Column)({ length: 150 }),
    __metadata("design:type", String)
], GuarantorOrmEntity.prototype, "name", void 0);
__decorate([
    (0, classes_1.AutoMap)(),
    (0, typeorm_1.Column)({ length: 150, default: '' }),
    __metadata("design:type", String)
], GuarantorOrmEntity.prototype, "fatherName", void 0);
__decorate([
    (0, classes_1.AutoMap)(),
    (0, typeorm_1.Column)({ length: 150, default: '' }),
    __metadata("design:type", String)
], GuarantorOrmEntity.prototype, "motherName", void 0);
__decorate([
    (0, classes_1.AutoMap)(),
    (0, typeorm_1.Column)({ length: 30 }),
    __metadata("design:type", String)
], GuarantorOrmEntity.prototype, "mobileNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], GuarantorOrmEntity.prototype, "phoneNumbers", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], GuarantorOrmEntity.prototype, "documents", void 0);
__decorate([
    (0, classes_1.AutoMap)(),
    (0, typeorm_1.Column)({ length: 50 }),
    __metadata("design:type", String)
], GuarantorOrmEntity.prototype, "nidNumber", void 0);
__decorate([
    (0, classes_1.AutoMap)(),
    (0, typeorm_1.Column)('text'),
    __metadata("design:type", String)
], GuarantorOrmEntity.prototype, "address", void 0);
__decorate([
    (0, classes_1.AutoMap)(),
    (0, typeorm_1.Column)({ length: 100, default: '' }),
    __metadata("design:type", String)
], GuarantorOrmEntity.prototype, "relationship", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => customer_orm_entity_1.CustomerOrmEntity, (customer) => customer.guarantors, {
        nullable: true,
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'customerId' }),
    __metadata("design:type", Object)
], GuarantorOrmEntity.prototype, "customer", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => employee_orm_entity_1.EmployeeOrmEntity, (employee) => employee.guarantors, {
        nullable: true,
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'employeeId' }),
    __metadata("design:type", Object)
], GuarantorOrmEntity.prototype, "employee", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => company_orm_entity_1.CompanyOrmEntity, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'companyId' }),
    __metadata("design:type", company_orm_entity_1.CompanyOrmEntity)
], GuarantorOrmEntity.prototype, "company", void 0);
exports.GuarantorOrmEntity = GuarantorOrmEntity = __decorate([
    (0, typeorm_1.Entity)('guarantors'),
    (0, typeorm_1.Index)(['companyId', 'customerId']),
    (0, typeorm_1.Index)(['companyId', 'employeeId']),
    (0, typeorm_1.Index)(['companyId', 'nidNumber'])
], GuarantorOrmEntity);
//# sourceMappingURL=guarantor.orm-entity.js.map