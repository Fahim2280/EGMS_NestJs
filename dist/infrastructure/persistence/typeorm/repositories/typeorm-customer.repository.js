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
exports.TypeOrmCustomerRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const index_1 = require("../../../../domain/index");
const customer_orm_entity_1 = require("../entities/customer.orm-entity");
const generic_typeorm_repository_1 = require("./generic-typeorm.repository");
let TypeOrmCustomerRepository = class TypeOrmCustomerRepository extends generic_typeorm_repository_1.GenericTypeOrmRepository {
    customerRepo;
    constructor(customerRepo) {
        super(customerRepo);
        this.customerRepo = customerRepo;
    }
    async findByCompanyId(companyId) {
        const orms = await this.customerRepo.find({
            where: { companyId, isDeleted: false },
            relations: { garage: true },
            order: { createdDate: 'DESC' },
        });
        return orms.map((orm) => this.toDomain(orm));
    }
    async findByGarageId(companyId, garageId) {
        const orms = await this.customerRepo.find({
            where: { companyId, garageId, isDeleted: false },
            relations: { garage: true },
            order: { createdDate: 'DESC' },
        });
        return orms.map((orm) => this.toDomain(orm));
    }
    async countByGarageId(companyId, garageId) {
        return this.customerRepo.count({
            where: { companyId, garageId, isDeleted: false },
        });
    }
    async getByIdAsync(id) {
        const orm = await this.customerRepo.findOne({
            where: { id },
            relations: { garage: true },
        });
        return orm ? this.toDomain(orm) : null;
    }
    async findByNid(companyId, nid, excludeId) {
        const qb = this.customerRepo
            .createQueryBuilder('c')
            .leftJoinAndSelect('c.garage', 'g')
            .where('c.companyId = :companyId', { companyId })
            .andWhere('c.nidNumber = :nid', { nid: nid.trim() })
            .andWhere('c.isDeleted = :isDeleted', { isDeleted: false });
        if (excludeId) {
            qb.andWhere('c.id != :excludeId', { excludeId });
        }
        const orm = await qb.getOne();
        return orm ? this.toDomain(orm) : null;
    }
    async findByMobile(companyId, mobile, excludeId) {
        const trimmed = mobile.trim();
        const phonePattern = `%"number":"${trimmed}"%`;
        const qb = this.customerRepo
            .createQueryBuilder('c')
            .leftJoinAndSelect('c.garage', 'g')
            .where('c.companyId = :companyId', { companyId })
            .andWhere('(c.mobileNumber = :mobile OR c.phoneNumbers LIKE :phonePattern)', {
            mobile: trimmed,
            phonePattern,
        })
            .andWhere('c.isDeleted = :isDeleted', { isDeleted: false });
        if (excludeId) {
            qb.andWhere('c.id != :excludeId', { excludeId });
        }
        const orm = await qb.getOne();
        return orm ? this.toDomain(orm) : null;
    }
    async findByCustomerCode(companyId, code, excludeId) {
        const qb = this.customerRepo
            .createQueryBuilder('c')
            .leftJoinAndSelect('c.garage', 'g')
            .where('c.companyId = :companyId', { companyId })
            .andWhere('c.customerCode = :code', { code: code.trim() })
            .andWhere('c.isDeleted = :isDeleted', { isDeleted: false });
        if (excludeId) {
            qb.andWhere('c.id != :excludeId', { excludeId });
        }
        const orm = await qb.getOne();
        return orm ? this.toDomain(orm) : null;
    }
    async countByCompanyId(companyId) {
        return this.customerRepo.count({
            where: { companyId, isDeleted: false },
        });
    }
    toDomain(orm) {
        return new index_1.Customer({
            id: orm.id,
            cId: orm.cId,
            companyId: orm.companyId,
            customerCode: orm.customerCode || null,
            name: orm.name,
            fatherName: orm.fatherName,
            motherName: orm.motherName,
            address: orm.address,
            mobileNumber: orm.mobileNumber,
            phoneNumbers: Array.isArray(orm.phoneNumbers) ? orm.phoneNumbers : undefined,
            documents: Array.isArray(orm.documents) ? orm.documents : [],
            nidNumber: orm.nidNumber,
            previousUnit: Number(orm.previousUnit),
            advanceMoney: Number(orm.advanceMoney),
            garageId: orm.garageId || undefined,
            garageName: orm.garage ? orm.garage.garageName : undefined,
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
        const orm = new customer_orm_entity_1.CustomerOrmEntity();
        orm.id = domain.id;
        orm.cId = domain.cId ?? 0;
        orm.companyId = domain.companyId;
        orm.customerCode = domain.customerCode || null;
        orm.name = domain.name;
        orm.fatherName = domain.fatherName;
        orm.motherName = domain.motherName;
        orm.address = domain.address;
        orm.mobileNumber = domain.mobileNumber;
        orm.phoneNumbers = domain.phoneNumbers || null;
        orm.documents = domain.documents || null;
        orm.nidNumber = domain.nidNumber;
        orm.previousUnit = domain.previousUnit;
        orm.advanceMoney = domain.advanceMoney;
        orm.garageId = domain.garageId || null;
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
exports.TypeOrmCustomerRepository = TypeOrmCustomerRepository;
exports.TypeOrmCustomerRepository = TypeOrmCustomerRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(customer_orm_entity_1.CustomerOrmEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], TypeOrmCustomerRepository);
//# sourceMappingURL=typeorm-customer.repository.js.map