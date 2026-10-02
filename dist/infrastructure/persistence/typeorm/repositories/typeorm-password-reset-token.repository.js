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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypeOrmPasswordResetTokenRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const index_1 = require("../../../../domain/index");
const password_reset_token_orm_entity_1 = require("../entities/password-reset-token.orm-entity");
let TypeOrmPasswordResetTokenRepository = class TypeOrmPasswordResetTokenRepository {
    tokenRepo;
    constructor(tokenRepo) {
        this.tokenRepo = tokenRepo;
    }
    async save(token) {
        const orm = new password_reset_token_orm_entity_1.PasswordResetTokenOrmEntity();
        orm.id = token.id;
        orm.email = token.email;
        orm.token = token.token;
        orm.expiresAt = token.expiresAt;
        orm.isUsed = token.isUsed;
        await this.tokenRepo.save(orm);
    }
    async findByTokenAndEmail(token, email) {
        const orm = await this.tokenRepo.findOne({
            where: {
                token,
                email: email.trim().toLowerCase(),
            },
        });
        if (!orm)
            return null;
        return new index_1.PasswordResetToken({
            id: orm.id,
            email: orm.email,
            token: orm.token,
            expiresAt: orm.expiresAt,
            isUsed: orm.isUsed,
            createdAt: orm.createdAt,
        });
    }
    async invalidateExistingTokens(email) {
        await this.tokenRepo.update({ email: email.trim().toLowerCase() }, { isUsed: true });
    }
};
exports.TypeOrmPasswordResetTokenRepository = TypeOrmPasswordResetTokenRepository;
exports.TypeOrmPasswordResetTokenRepository = TypeOrmPasswordResetTokenRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(password_reset_token_orm_entity_1.PasswordResetTokenOrmEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], TypeOrmPasswordResetTokenRepository);
//# sourceMappingURL=typeorm-password-reset-token.repository.js.map