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
exports.CompanyOrmEntity = void 0;
const typeorm_1 = require("typeorm");
const classes_1 = require("@automapper/classes");
const base_auditable_orm_entity_1 = require("./base-auditable.orm-entity");
const garage_orm_entity_1 = require("./garage.orm-entity");
const employee_orm_entity_1 = require("./employee.orm-entity");
let CompanyOrmEntity = class CompanyOrmEntity extends base_auditable_orm_entity_1.BaseAuditableOrmEntity {
    id;
    name;
    companyName;
    email;
    password;
    phoneNumber;
    role;
    address;
    unitRate;
    registrationStatus;
    garages;
    employees;
    customers;
};
exports.CompanyOrmEntity = CompanyOrmEntity;
__decorate([
    (0, classes_1.AutoMap)(),
    (0, typeorm_1.PrimaryColumn)('varchar', { length: 100 }),
    __metadata("design:type", String)
], CompanyOrmEntity.prototype, "id", void 0);
__decorate([
    (0, classes_1.AutoMap)(),
    (0, typeorm_1.Column)({ length: 100 }),
    __metadata("design:type", String)
], CompanyOrmEntity.prototype, "name", void 0);
__decorate([
    (0, classes_1.AutoMap)(),
    (0, typeorm_1.Column)({ length: 150 }),
    __metadata("design:type", String)
], CompanyOrmEntity.prototype, "companyName", void 0);
__decorate([
    (0, classes_1.AutoMap)(),
    (0, typeorm_1.Index)({ unique: true }),
    (0, typeorm_1.Column)({ length: 150 }),
    __metadata("design:type", String)
], CompanyOrmEntity.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255 }),
    __metadata("design:type", String)
], CompanyOrmEntity.prototype, "password", void 0);
__decorate([
    (0, classes_1.AutoMap)(),
    (0, typeorm_1.Column)({ length: 30 }),
    __metadata("design:type", String)
], CompanyOrmEntity.prototype, "phoneNumber", void 0);
__decorate([
    (0, classes_1.AutoMap)(),
    (0, typeorm_1.Column)({ type: 'varchar', length: 20, default: 'SUPER_ADMIN' }),
    __metadata("design:type", String)
], CompanyOrmEntity.prototype, "role", void 0);
__decorate([
    (0, classes_1.AutoMap)(),
    (0, typeorm_1.Column)('text'),
    __metadata("design:type", String)
], CompanyOrmEntity.prototype, "address", void 0);
__decorate([
    (0, classes_1.AutoMap)(),
    (0, typeorm_1.Column)('decimal', { precision: 10, scale: 2, default: 15 }),
    __metadata("design:type", Number)
], CompanyOrmEntity.prototype, "unitRate", void 0);
__decorate([
    (0, classes_1.AutoMap)(),
    (0, typeorm_1.Column)({ type: 'varchar', length: 20, default: 'PENDING' }),
    __metadata("design:type", String)
], CompanyOrmEntity.prototype, "registrationStatus", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => garage_orm_entity_1.GarageOrmEntity, (garage) => garage.company, {
        cascade: true,
    }),
    __metadata("design:type", Array)
], CompanyOrmEntity.prototype, "garages", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => employee_orm_entity_1.EmployeeOrmEntity, (emp) => emp.company, {
        cascade: true,
    }),
    __metadata("design:type", Array)
], CompanyOrmEntity.prototype, "employees", void 0);
__decorate([
    (0, typeorm_1.OneToMany)('CustomerOrmEntity', (customer) => customer.company, {
        cascade: true,
    }),
    __metadata("design:type", Array)
], CompanyOrmEntity.prototype, "customers", void 0);
exports.CompanyOrmEntity = CompanyOrmEntity = __decorate([
    (0, typeorm_1.Entity)('companies')
], CompanyOrmEntity);
//# sourceMappingURL=company.orm-entity.js.map