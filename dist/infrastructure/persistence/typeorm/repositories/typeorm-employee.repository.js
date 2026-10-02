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
exports.TypeOrmEmployeeRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const index_1 = require("../../../../domain/index");
const employee_orm_entity_1 = require("../entities/employee.orm-entity");
const garage_orm_entity_1 = require("../entities/garage.orm-entity");
const generic_typeorm_repository_1 = require("./generic-typeorm.repository");
let TypeOrmEmployeeRepository = class TypeOrmEmployeeRepository extends generic_typeorm_repository_1.GenericTypeOrmRepository {
    employeeRepo;
    garageRepo;
    constructor(employeeRepo, garageRepo) {
        super(employeeRepo);
        this.employeeRepo = employeeRepo;
        this.garageRepo = garageRepo;
    }
    async findByEmail(email) {
        const orm = await this.employeeRepo.findOne({
            where: { email: email.trim().toLowerCase(), isDeleted: false },
            relations: { permittedGarages: true },
        });
        return orm ? this.toDomain(orm) : null;
    }
    async findByNid(nidNumber) {
        const orm = await this.employeeRepo.findOne({
            where: { nidNumber: nidNumber.trim(), isDeleted: false },
            relations: { permittedGarages: true },
        });
        return orm ? this.toDomain(orm) : null;
    }
    async findByCompanyId(companyId) {
        const orms = await this.employeeRepo.find({
            where: { companyId, isDeleted: false },
            relations: { permittedGarages: true },
            order: { createdDate: 'DESC' },
        });
        return orms.map((orm) => this.toDomain(orm));
    }
    async findById(id) {
        const orm = await this.employeeRepo.findOne({
            where: { id, isDeleted: false },
            relations: { permittedGarages: true },
        });
        return orm ? this.toDomain(orm) : null;
    }
    async countByCompanyId(companyId) {
        return this.countAsync({ companyId });
    }
    async saveWithGarages(employee, garageIds) {
        const orm = this.toOrm(employee);
        await this.employeeRepo.manager.transaction(async (manager) => {
            await manager.getRepository(employee_orm_entity_1.EmployeeOrmEntity).save(orm);
            await manager.query('DELETE FROM employee_garages WHERE employeeId = ?', [
                employee.id,
            ]);
            if (garageIds && Array.isArray(garageIds) && garageIds.length > 0) {
                const validGarages = await manager.getRepository(garage_orm_entity_1.GarageOrmEntity).findBy({
                    id: (0, typeorm_2.In)(garageIds),
                    companyId: employee.companyId,
                    isDeleted: false,
                });
                for (const g of validGarages) {
                    await manager.query('INSERT INTO employee_garages (employeeId, garageId) VALUES (?, ?)', [employee.id, g.id]);
                }
            }
        });
        const updated = await this.findById(employee.id);
        return updated || employee;
    }
    toDomain(orm) {
        return new index_1.Employee({
            id: orm.id,
            companyId: orm.companyId,
            name: orm.name,
            address: orm.address,
            email: orm.email,
            password: orm.password,
            phoneNumber: orm.phoneNumber,
            phoneNumbers: Array.isArray(orm.phoneNumbers) ? orm.phoneNumbers : undefined,
            documents: Array.isArray(orm.documents) ? orm.documents : [],
            role: orm.role,
            nidNumber: orm.nidNumber,
            canCreate: orm.canCreate,
            canEdit: orm.canEdit,
            canDelete: orm.canDelete,
            canView: orm.canView,
            permittedGarageIds: orm.permittedGarages ? orm.permittedGarages.map((g) => g.id) : [],
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
        const orm = new employee_orm_entity_1.EmployeeOrmEntity();
        orm.id = domain.id;
        orm.companyId = domain.companyId;
        orm.name = domain.name;
        orm.address = domain.address;
        orm.email = domain.email;
        orm.password = domain.password;
        orm.phoneNumber = domain.phoneNumber;
        orm.phoneNumbers = domain.phoneNumbers || null;
        orm.documents = domain.documents || null;
        orm.role = domain.role;
        orm.nidNumber = domain.nidNumber;
        orm.canCreate = domain.canCreate;
        orm.canEdit = domain.canEdit;
        orm.canDelete = domain.canDelete;
        orm.canView = domain.canView;
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
exports.TypeOrmEmployeeRepository = TypeOrmEmployeeRepository;
exports.TypeOrmEmployeeRepository = TypeOrmEmployeeRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(employee_orm_entity_1.EmployeeOrmEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(garage_orm_entity_1.GarageOrmEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], TypeOrmEmployeeRepository);
//# sourceMappingURL=typeorm-employee.repository.js.map