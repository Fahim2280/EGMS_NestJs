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
exports.CompanyApprovalTokenOrmEntity = void 0;
const typeorm_1 = require("typeorm");
let CompanyApprovalTokenOrmEntity = class CompanyApprovalTokenOrmEntity {
    id;
    companyId;
    token;
    expiresAt;
    isUsed;
    createdAt;
};
exports.CompanyApprovalTokenOrmEntity = CompanyApprovalTokenOrmEntity;
__decorate([
    (0, typeorm_1.PrimaryColumn)('varchar', { length: 100 }),
    __metadata("design:type", String)
], CompanyApprovalTokenOrmEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)('varchar', { length: 100 }),
    __metadata("design:type", String)
], CompanyApprovalTokenOrmEntity.prototype, "companyId", void 0);
__decorate([
    (0, typeorm_1.Index)({ unique: true }),
    (0, typeorm_1.Column)('varchar', { length: 255 }),
    __metadata("design:type", String)
], CompanyApprovalTokenOrmEntity.prototype, "token", void 0);
__decorate([
    (0, typeorm_1.Column)('datetime'),
    __metadata("design:type", Date)
], CompanyApprovalTokenOrmEntity.prototype, "expiresAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], CompanyApprovalTokenOrmEntity.prototype, "isUsed", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], CompanyApprovalTokenOrmEntity.prototype, "createdAt", void 0);
exports.CompanyApprovalTokenOrmEntity = CompanyApprovalTokenOrmEntity = __decorate([
    (0, typeorm_1.Entity)('company_approval_tokens')
], CompanyApprovalTokenOrmEntity);
//# sourceMappingURL=company-approval-token.orm-entity.js.map