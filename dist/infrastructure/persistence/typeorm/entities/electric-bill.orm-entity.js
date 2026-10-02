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
exports.ElectricBillOrmEntity = void 0;
const typeorm_1 = require("typeorm");
const classes_1 = require("@automapper/classes");
const base_auditable_orm_entity_1 = require("./base-auditable.orm-entity");
const company_orm_entity_1 = require("./company.orm-entity");
const customer_orm_entity_1 = require("./customer.orm-entity");
let ElectricBillOrmEntity = class ElectricBillOrmEntity extends base_auditable_orm_entity_1.BaseAuditableOrmEntity {
    id;
    billNumber;
    customerId;
    companyId;
    date;
    fromDate;
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
    customer;
    company;
};
exports.ElectricBillOrmEntity = ElectricBillOrmEntity;
__decorate([
    (0, classes_1.AutoMap)(),
    (0, typeorm_1.PrimaryColumn)('varchar', { length: 100 }),
    __metadata("design:type", String)
], ElectricBillOrmEntity.prototype, "id", void 0);
__decorate([
    (0, classes_1.AutoMap)(),
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], ElectricBillOrmEntity.prototype, "billNumber", void 0);
__decorate([
    (0, classes_1.AutoMap)(),
    (0, typeorm_1.Column)('varchar', { length: 100 }),
    __metadata("design:type", String)
], ElectricBillOrmEntity.prototype, "customerId", void 0);
__decorate([
    (0, classes_1.AutoMap)(),
    (0, typeorm_1.Column)('varchar', { length: 100 }),
    __metadata("design:type", String)
], ElectricBillOrmEntity.prototype, "companyId", void 0);
__decorate([
    (0, classes_1.AutoMap)(),
    (0, typeorm_1.Column)('datetime'),
    __metadata("design:type", Date)
], ElectricBillOrmEntity.prototype, "date", void 0);
__decorate([
    (0, classes_1.AutoMap)(),
    (0, typeorm_1.Column)({ type: 'datetime', nullable: true }),
    __metadata("design:type", Date)
], ElectricBillOrmEntity.prototype, "fromDate", void 0);
__decorate([
    (0, classes_1.AutoMap)(),
    (0, typeorm_1.Column)('decimal', { precision: 18, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], ElectricBillOrmEntity.prototype, "previousUnit", void 0);
__decorate([
    (0, classes_1.AutoMap)(),
    (0, typeorm_1.Column)('decimal', { precision: 18, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], ElectricBillOrmEntity.prototype, "currentUnit", void 0);
__decorate([
    (0, classes_1.AutoMap)(),
    (0, typeorm_1.Column)('decimal', { precision: 18, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], ElectricBillOrmEntity.prototype, "totalUnit", void 0);
__decorate([
    (0, classes_1.AutoMap)(),
    (0, typeorm_1.Column)('decimal', { precision: 18, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], ElectricBillOrmEntity.prototype, "electricBill", void 0);
__decorate([
    (0, classes_1.AutoMap)(),
    (0, typeorm_1.Column)('decimal', { precision: 10, scale: 2, default: 15 }),
    __metadata("design:type", Number)
], ElectricBillOrmEntity.prototype, "unitRate", void 0);
__decorate([
    (0, classes_1.AutoMap)(),
    (0, typeorm_1.Column)('decimal', { precision: 18, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], ElectricBillOrmEntity.prototype, "previousDues", void 0);
__decorate([
    (0, classes_1.AutoMap)(),
    (0, typeorm_1.Column)('decimal', { precision: 18, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], ElectricBillOrmEntity.prototype, "rentBill", void 0);
__decorate([
    (0, classes_1.AutoMap)(),
    (0, typeorm_1.Column)('decimal', { precision: 18, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], ElectricBillOrmEntity.prototype, "loan", void 0);
__decorate([
    (0, classes_1.AutoMap)(),
    (0, typeorm_1.Column)('decimal', { precision: 18, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], ElectricBillOrmEntity.prototype, "totalBill", void 0);
__decorate([
    (0, classes_1.AutoMap)(),
    (0, typeorm_1.Column)('decimal', { precision: 18, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], ElectricBillOrmEntity.prototype, "clearMoney", void 0);
__decorate([
    (0, classes_1.AutoMap)(),
    (0, typeorm_1.Column)('decimal', { precision: 18, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], ElectricBillOrmEntity.prototype, "presentDues", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => customer_orm_entity_1.CustomerOrmEntity, (customer) => customer.bills, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'customerId' }),
    __metadata("design:type", customer_orm_entity_1.CustomerOrmEntity)
], ElectricBillOrmEntity.prototype, "customer", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => company_orm_entity_1.CompanyOrmEntity, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'companyId' }),
    __metadata("design:type", company_orm_entity_1.CompanyOrmEntity)
], ElectricBillOrmEntity.prototype, "company", void 0);
exports.ElectricBillOrmEntity = ElectricBillOrmEntity = __decorate([
    (0, typeorm_1.Entity)('electric_bills'),
    (0, typeorm_1.Index)(['companyId', 'date']),
    (0, typeorm_1.Index)(['customerId', 'date'])
], ElectricBillOrmEntity);
//# sourceMappingURL=electric-bill.orm-entity.js.map