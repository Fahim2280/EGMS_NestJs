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
exports.PasswordResetTokenOrmEntity = void 0;
const typeorm_1 = require("typeorm");
let PasswordResetTokenOrmEntity = class PasswordResetTokenOrmEntity {
    id;
    email;
    token;
    expiresAt;
    isUsed;
    createdAt;
};
exports.PasswordResetTokenOrmEntity = PasswordResetTokenOrmEntity;
__decorate([
    (0, typeorm_1.PrimaryColumn)('varchar', { length: 100 }),
    __metadata("design:type", String)
], PasswordResetTokenOrmEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ length: 150 }),
    __metadata("design:type", String)
], PasswordResetTokenOrmEntity.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Index)({ unique: true }),
    (0, typeorm_1.Column)({ length: 255 }),
    __metadata("design:type", String)
], PasswordResetTokenOrmEntity.prototype, "token", void 0);
__decorate([
    (0, typeorm_1.Column)('datetime'),
    __metadata("design:type", Date)
], PasswordResetTokenOrmEntity.prototype, "expiresAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], PasswordResetTokenOrmEntity.prototype, "isUsed", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], PasswordResetTokenOrmEntity.prototype, "createdAt", void 0);
exports.PasswordResetTokenOrmEntity = PasswordResetTokenOrmEntity = __decorate([
    (0, typeorm_1.Entity)('password_reset_tokens')
], PasswordResetTokenOrmEntity);
//# sourceMappingURL=password-reset-token.orm-entity.js.map