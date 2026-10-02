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
exports.AuditLogOrmEntity = void 0;
const typeorm_1 = require("typeorm");
const classes_1 = require("@automapper/classes");
let AuditLogOrmEntity = class AuditLogOrmEntity {
    id;
    companyId;
    userId;
    userName;
    userRole;
    action;
    entityType;
    entityId;
    entityName;
    details;
    ipAddress;
    userAgent;
    createdDate;
};
exports.AuditLogOrmEntity = AuditLogOrmEntity;
__decorate([
    (0, classes_1.AutoMap)(() => String),
    (0, typeorm_1.PrimaryColumn)('varchar', { length: 100 }),
    __metadata("design:type", String)
], AuditLogOrmEntity.prototype, "id", void 0);
__decorate([
    (0, classes_1.AutoMap)(() => String),
    (0, typeorm_1.Column)('varchar', { length: 100 }),
    __metadata("design:type", String)
], AuditLogOrmEntity.prototype, "companyId", void 0);
__decorate([
    (0, classes_1.AutoMap)(() => String),
    (0, typeorm_1.Column)('varchar', { length: 100 }),
    __metadata("design:type", String)
], AuditLogOrmEntity.prototype, "userId", void 0);
__decorate([
    (0, classes_1.AutoMap)(() => String),
    (0, typeorm_1.Column)('varchar', { length: 150 }),
    __metadata("design:type", String)
], AuditLogOrmEntity.prototype, "userName", void 0);
__decorate([
    (0, classes_1.AutoMap)(() => String),
    (0, typeorm_1.Column)('varchar', { length: 50, default: 'GENERAL' }),
    __metadata("design:type", String)
], AuditLogOrmEntity.prototype, "userRole", void 0);
__decorate([
    (0, classes_1.AutoMap)(() => String),
    (0, typeorm_1.Column)('varchar', { length: 50 }),
    __metadata("design:type", String)
], AuditLogOrmEntity.prototype, "action", void 0);
__decorate([
    (0, classes_1.AutoMap)(() => String),
    (0, typeorm_1.Column)('varchar', { length: 50 }),
    __metadata("design:type", String)
], AuditLogOrmEntity.prototype, "entityType", void 0);
__decorate([
    (0, classes_1.AutoMap)(() => String),
    (0, typeorm_1.Column)('varchar', { length: 100, nullable: true, default: null }),
    __metadata("design:type", Object)
], AuditLogOrmEntity.prototype, "entityId", void 0);
__decorate([
    (0, classes_1.AutoMap)(() => String),
    (0, typeorm_1.Column)('varchar', { length: 255, nullable: true, default: null }),
    __metadata("design:type", Object)
], AuditLogOrmEntity.prototype, "entityName", void 0);
__decorate([
    (0, classes_1.AutoMap)(() => String),
    (0, typeorm_1.Column)('text', { nullable: true }),
    __metadata("design:type", Object)
], AuditLogOrmEntity.prototype, "details", void 0);
__decorate([
    (0, classes_1.AutoMap)(() => String),
    (0, typeorm_1.Column)('varchar', { length: 50, nullable: true, default: null }),
    __metadata("design:type", Object)
], AuditLogOrmEntity.prototype, "ipAddress", void 0);
__decorate([
    (0, classes_1.AutoMap)(() => String),
    (0, typeorm_1.Column)('varchar', { length: 255, nullable: true, default: null }),
    __metadata("design:type", Object)
], AuditLogOrmEntity.prototype, "userAgent", void 0);
__decorate([
    (0, classes_1.AutoMap)(() => Date),
    (0, typeorm_1.CreateDateColumn)({ type: 'datetime' }),
    __metadata("design:type", Date)
], AuditLogOrmEntity.prototype, "createdDate", void 0);
exports.AuditLogOrmEntity = AuditLogOrmEntity = __decorate([
    (0, typeorm_1.Entity)('audit_logs'),
    (0, typeorm_1.Index)(['companyId', 'createdDate']),
    (0, typeorm_1.Index)(['companyId', 'action']),
    (0, typeorm_1.Index)(['companyId', 'entityType'])
], AuditLogOrmEntity);
//# sourceMappingURL=audit-log.orm-entity.js.map