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
exports.TypeOrmGarageRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const index_1 = require("../../../../domain/index");
const garage_orm_entity_1 = require("../entities/garage.orm-entity");
const generic_typeorm_repository_1 = require("./generic-typeorm.repository");
let TypeOrmGarageRepository = class TypeOrmGarageRepository extends generic_typeorm_repository_1.GenericTypeOrmRepository {
    garageRepo;
    constructor(garageRepo) {
        super(garageRepo);
        this.garageRepo = garageRepo;
    }
    async findByCompanyId(companyId) {
        return this.getAllAsync({ filter: { companyId } });
    }
    toDomain(orm) {
        return new index_1.Garage({
            id: orm.id,
            garageName: orm.garageName,
            address: orm.address,
            companyId: orm.companyId,
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
        const orm = new garage_orm_entity_1.GarageOrmEntity();
        orm.id = domain.id;
        orm.garageName = domain.garageName;
        orm.address = domain.address;
        orm.companyId = domain.companyId;
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
exports.TypeOrmGarageRepository = TypeOrmGarageRepository;
exports.TypeOrmGarageRepository = TypeOrmGarageRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(garage_orm_entity_1.GarageOrmEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], TypeOrmGarageRepository);
//# sourceMappingURL=typeorm-garage.repository.js.map