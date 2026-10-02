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
exports.TypeOrmGuarantorRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const index_1 = require("../../../../domain/index");
const guarantor_orm_entity_1 = require("../entities/guarantor.orm-entity");
const generic_typeorm_repository_1 = require("./generic-typeorm.repository");
let TypeOrmGuarantorRepository = class TypeOrmGuarantorRepository extends generic_typeorm_repository_1.GenericTypeOrmRepository {
    guarantorRepo;
    constructor(guarantorRepo) {
        super(guarantorRepo);
        this.guarantorRepo = guarantorRepo;
    }
    async findByCustomerId(customerId) {
        const orms = await this.guarantorRepo.find({
            where: { customerId, isDeleted: false },
            order: { createdDate: 'ASC' },
        });
        return orms.map((orm) => this.toDomain(orm));
    }
    async findByEmployeeId(employeeId) {
        const orms = await this.guarantorRepo.find({
            where: { employeeId, isDeleted: false },
            order: { createdDate: 'ASC' },
        });
        return orms.map((orm) => this.toDomain(orm));
    }
    async findByCompanyId(companyId) {
        const orms = await this.guarantorRepo.find({
            where: { companyId, isDeleted: false },
            order: { createdDate: 'DESC' },
        });
        return orms.map((orm) => this.toDomain(orm));
    }
    async countByCustomerId(customerId) {
        return this.guarantorRepo.count({
            where: { customerId, isDeleted: false },
        });
    }
    async countByEmployeeId(employeeId) {
        return this.guarantorRepo.count({
            where: { employeeId, isDeleted: false },
        });
    }
    async findByCustomerAndNid(customerId, nidNumber, excludeId) {
        const qb = this.guarantorRepo
            .createQueryBuilder('g')
            .where('g.customerId = :customerId', { customerId })
            .andWhere('g.nidNumber = :nidNumber', { nidNumber: nidNumber.trim() })
            .andWhere('g.isDeleted = :isDeleted', { isDeleted: false });
        if (excludeId) {
            qb.andWhere('g.id != :excludeId', { excludeId });
        }
        const orm = await qb.getOne();
        return orm ? this.toDomain(orm) : null;
    }
    async findByEmployeeAndNid(employeeId, nidNumber, excludeId) {
        const qb = this.guarantorRepo
            .createQueryBuilder('g')
            .where('g.employeeId = :employeeId', { employeeId })
            .andWhere('g.nidNumber = :nidNumber', { nidNumber: nidNumber.trim() })
            .andWhere('g.isDeleted = :isDeleted', { isDeleted: false });
        if (excludeId) {
            qb.andWhere('g.id != :excludeId', { excludeId });
        }
        const orm = await qb.getOne();
        return orm ? this.toDomain(orm) : null;
    }
    toDomain(orm) {
        return new index_1.Guarantor({
            id: orm.id,
            customerId: orm.customerId || undefined,
            employeeId: orm.employeeId || undefined,
            companyId: orm.companyId,
            name: orm.name,
            fatherName: orm.fatherName,
            motherName: orm.motherName,
            address: orm.address,
            mobileNumber: orm.mobileNumber,
            phoneNumbers: Array.isArray(orm.phoneNumbers) ? orm.phoneNumbers : undefined,
            documents: Array.isArray(orm.documents) ? orm.documents : [],
            nidNumber: orm.nidNumber,
            relationship: orm.relationship,
            isActive: orm.isActive,
            isDeleted: orm.isDeleted,
            createdBy: orm.createdBy,
            editByName: orm.editByName,
            deletedBy: orm.deletedBy,
            createdDate: orm.createdDate ? new Date(orm.createdDate) : new Date(),
            modifiedDate: orm.modifiedDate ? new Date(orm.modifiedDate) : undefined,
            deletedDate: orm.deletedDate ? new Date(orm.deletedDate) : undefined,
        });
    }
    toOrm(domain) {
        const orm = new guarantor_orm_entity_1.GuarantorOrmEntity();
        orm.id = domain.id;
        orm.customerId = domain.customerId || null;
        orm.employeeId = domain.employeeId || null;
        orm.companyId = domain.companyId;
        orm.name = domain.name;
        orm.fatherName = domain.fatherName;
        orm.motherName = domain.motherName;
        orm.address = domain.address;
        orm.mobileNumber = domain.mobileNumber;
        orm.phoneNumbers = domain.phoneNumbers || null;
        orm.documents = domain.documents || null;
        orm.nidNumber = domain.nidNumber;
        orm.relationship = domain.relationship;
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
exports.TypeOrmGuarantorRepository = TypeOrmGuarantorRepository;
exports.TypeOrmGuarantorRepository = TypeOrmGuarantorRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(guarantor_orm_entity_1.GuarantorOrmEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], TypeOrmGuarantorRepository);
//# sourceMappingURL=typeorm-guarantor.repository.js.map