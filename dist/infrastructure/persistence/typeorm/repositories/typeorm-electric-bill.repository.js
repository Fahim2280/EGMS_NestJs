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
exports.TypeOrmElectricBillRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const index_1 = require("../../../../domain/index");
const electric_bill_orm_entity_1 = require("../entities/electric-bill.orm-entity");
const generic_typeorm_repository_1 = require("./generic-typeorm.repository");
let TypeOrmElectricBillRepository = class TypeOrmElectricBillRepository extends generic_typeorm_repository_1.GenericTypeOrmRepository {
    billRepo;
    constructor(billRepo) {
        super(billRepo);
        this.billRepo = billRepo;
    }
    async findByCustomerId(customerId) {
        return this.getAllAsync({
            filter: { customerId },
            orderBy: { date: 'DESC' },
        });
    }
    async findLatestByCustomerId(customerId) {
        const bills = await this.billRepo.find({
            where: { customerId, isDeleted: false },
            order: { date: 'DESC' },
            take: 1,
        });
        return bills.length > 0 ? this.toDomain(bills[0]) : null;
    }
    async findPreviousBill(customerId, beforeDate, excludeBillId) {
        const qb = this.billRepo
            .createQueryBuilder('b')
            .where('b.customerId = :customerId', { customerId })
            .andWhere('b.date < :beforeDate', { beforeDate })
            .andWhere('b.isDeleted = :isDeleted', { isDeleted: false });
        if (excludeBillId) {
            qb.andWhere('b.id != :excludeBillId', { excludeBillId });
        }
        qb.orderBy('b.date', 'DESC').take(1);
        const orm = await qb.getOne();
        return orm ? this.toDomain(orm) : null;
    }
    async findSubsequentBills(customerId, afterDate) {
        const orms = await this.billRepo
            .createQueryBuilder('b')
            .where('b.customerId = :customerId', { customerId })
            .andWhere('b.date > :afterDate', { afterDate })
            .andWhere('b.isDeleted = :isDeleted', { isDeleted: false })
            .orderBy('b.date', 'ASC')
            .getMany();
        return orms.map((orm) => this.toDomain(orm));
    }
    async findByCompanyId(companyId) {
        return this.getAllAsync({
            filter: { companyId },
            orderBy: { date: 'DESC' },
        });
    }
    async findByGarageId(companyId, garageId) {
        const qb = this.billRepo
            .createQueryBuilder('b')
            .innerJoin('b.customer', 'c')
            .where('b.companyId = :companyId', { companyId })
            .andWhere('c.garageId = :garageId', { garageId })
            .andWhere('b.isDeleted = :isDeleted', { isDeleted: false })
            .orderBy('b.date', 'DESC');
        const orms = await qb.getMany();
        return orms.map((orm) => this.toDomain(orm));
    }
    toDomain(orm) {
        return new index_1.ElectricBill({
            id: orm.id,
            billNumber: orm.billNumber,
            customerId: orm.customerId,
            companyId: orm.companyId,
            date: orm.date ? new Date(orm.date) : new Date(),
            fromDate: orm.fromDate ? new Date(orm.fromDate) : undefined,
            previousUnit: Number(orm.previousUnit),
            currentUnit: Number(orm.currentUnit),
            totalUnit: Number(orm.totalUnit),
            electricBill: Number(orm.electricBill),
            unitRate: orm.unitRate != null ? Number(orm.unitRate) : 15,
            previousDues: Number(orm.previousDues),
            rentBill: Number(orm.rentBill),
            loan: Number(orm.loan),
            totalBill: Number(orm.totalBill),
            clearMoney: Number(orm.clearMoney),
            presentDues: Number(orm.presentDues),
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
        const orm = new electric_bill_orm_entity_1.ElectricBillOrmEntity();
        orm.id = domain.id;
        orm.billNumber = domain.billNumber ?? 0;
        orm.customerId = domain.customerId;
        orm.companyId = domain.companyId;
        orm.date = domain.date;
        orm.fromDate = domain.fromDate;
        orm.previousUnit = domain.previousUnit;
        orm.currentUnit = domain.currentUnit;
        orm.totalUnit = domain.totalUnit;
        orm.electricBill = domain.electricBill;
        orm.unitRate = domain.unitRate ?? 15;
        orm.previousDues = domain.previousDues;
        orm.rentBill = domain.rentBill;
        orm.loan = domain.loan;
        orm.totalBill = domain.totalBill;
        orm.clearMoney = domain.clearMoney;
        orm.presentDues = domain.presentDues;
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
exports.TypeOrmElectricBillRepository = TypeOrmElectricBillRepository;
exports.TypeOrmElectricBillRepository = TypeOrmElectricBillRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(electric_bill_orm_entity_1.ElectricBillOrmEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], TypeOrmElectricBillRepository);
//# sourceMappingURL=typeorm-electric-bill.repository.js.map