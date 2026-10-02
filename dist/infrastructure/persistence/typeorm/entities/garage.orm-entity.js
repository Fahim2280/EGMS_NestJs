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
exports.GarageOrmEntity = void 0;
const typeorm_1 = require("typeorm");
const classes_1 = require("@automapper/classes");
const base_auditable_orm_entity_1 = require("./base-auditable.orm-entity");
const company_orm_entity_1 = require("./company.orm-entity");
const customer_orm_entity_1 = require("./customer.orm-entity");
const employee_orm_entity_1 = require("./employee.orm-entity");
let GarageOrmEntity = class GarageOrmEntity extends base_auditable_orm_entity_1.BaseAuditableOrmEntity {
    id;
    garageName;
    address;
    companyId;
    company;
    customers;
    employees;
};
exports.GarageOrmEntity = GarageOrmEntity;
__decorate([
    (0, classes_1.AutoMap)(),
    (0, typeorm_1.PrimaryColumn)('varchar', { length: 100 }),
    __metadata("design:type", String)
], GarageOrmEntity.prototype, "id", void 0);
__decorate([
    (0, classes_1.AutoMap)(),
    (0, typeorm_1.Column)({ length: 150 }),
    __metadata("design:type", String)
], GarageOrmEntity.prototype, "garageName", void 0);
__decorate([
    (0, classes_1.AutoMap)(),
    (0, typeorm_1.Column)('text'),
    __metadata("design:type", String)
], GarageOrmEntity.prototype, "address", void 0);
__decorate([
    (0, classes_1.AutoMap)(),
    (0, typeorm_1.Column)('varchar', { length: 100 }),
    __metadata("design:type", String)
], GarageOrmEntity.prototype, "companyId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => company_orm_entity_1.CompanyOrmEntity, (company) => company.garages, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'companyId' }),
    __metadata("design:type", company_orm_entity_1.CompanyOrmEntity)
], GarageOrmEntity.prototype, "company", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => customer_orm_entity_1.CustomerOrmEntity, (customer) => customer.garage),
    __metadata("design:type", Array)
], GarageOrmEntity.prototype, "customers", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => employee_orm_entity_1.EmployeeOrmEntity, (employee) => employee.permittedGarages),
    __metadata("design:type", Array)
], GarageOrmEntity.prototype, "employees", void 0);
exports.GarageOrmEntity = GarageOrmEntity = __decorate([
    (0, typeorm_1.Entity)('garages')
], GarageOrmEntity);
//# sourceMappingURL=garage.orm-entity.js.map