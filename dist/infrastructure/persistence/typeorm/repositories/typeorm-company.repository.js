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
exports.TypeOrmCompanyRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const index_1 = require("../../../../domain/index");
const company_orm_entity_1 = require("../entities/company.orm-entity");
const generic_typeorm_repository_1 = require("./generic-typeorm.repository");
let TypeOrmCompanyRepository = class TypeOrmCompanyRepository extends generic_typeorm_repository_1.GenericTypeOrmRepository {
    companyRepo;
    constructor(companyRepo) {
        super(companyRepo);
        this.companyRepo = companyRepo;
    }
    async findByEmail(email) {
        return this.getFirstOrDefaultAsync({ email: email.trim().toLowerCase() });
    }
    toDomain(orm) {
        return new index_1.Company({
            id: orm.id,
            name: orm.name,
            companyName: orm.companyName,
            email: orm.email,
            password: orm.password,
            phoneNumber: orm.phoneNumber,
            role: orm.role,
            address: orm.address,
            isActive: orm.isActive,
            isDeleted: orm.isDeleted,
            createdBy: orm.createdBy,
            editByName: orm.editByName,
            deletedBy: orm.deletedBy,
            unitRate: orm.unitRate != null ? Number(orm.unitRate) : 15,
            registrationStatus: orm.registrationStatus ?? 'PENDING',
            createdDate: orm.createdDate ? new Date(orm.createdDate) : new Date(),
            modifiedDate: orm.modifiedDate ? new Date(orm.modifiedDate) : undefined,
            deletedDate: orm.deletedDate ? new Date(orm.deletedDate) : undefined,
        });
    }
    toOrm(domain) {
        const orm = new company_orm_entity_1.CompanyOrmEntity();
        orm.id = domain.id;
        orm.name = domain.name;
        orm.companyName = domain.companyName;
        orm.email = domain.email;
        orm.password = domain.password;
        orm.phoneNumber = domain.phoneNumber;
        orm.role = domain.role;
        orm.address = domain.address;
        orm.unitRate = domain.unitRate ?? 15;
        orm.registrationStatus = domain.registrationStatus ?? 'PENDING';
        orm.isActive = domain.isActive;
        orm.isDeleted = domain.isDeleted;
        orm.createdBy = domain.createdBy;
        orm.editByName = domain.editByName;
        orm.deletedBy = domain.deletedBy;
        orm.createdDate = domain.createdDate;
        orm.modifiedDate = domain.modifiedDate;
        orm.deletedDate = domain.deletedDate;
        return orm;
    }
};
exports.TypeOrmCompanyRepository = TypeOrmCompanyRepository;
exports.TypeOrmCompanyRepository = TypeOrmCompanyRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(company_orm_entity_1.CompanyOrmEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], TypeOrmCompanyRepository);
//# sourceMappingURL=typeorm-company.repository.js.map