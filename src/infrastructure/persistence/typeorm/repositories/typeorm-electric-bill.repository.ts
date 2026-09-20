import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ElectricBill, IElectricBillRepository } from '@domain/index';
import { ElectricBillOrmEntity } from '../entities/electric-bill.orm-entity';
import { GenericTypeOrmRepository } from './generic-typeorm.repository';

@Injectable()
export class TypeOrmElectricBillRepository
  extends GenericTypeOrmRepository<ElectricBill, ElectricBillOrmEntity>
  implements IElectricBillRepository
{
  constructor(
    @InjectRepository(ElectricBillOrmEntity)
    private readonly billRepo: Repository<ElectricBillOrmEntity>,
  ) {
    super(billRepo);
  }

  async findByCustomerId(customerId: string): Promise<ElectricBill[]> {
    return this.getAllAsync({
      filter: { customerId },
      orderBy: { date: 'DESC' },
    });
  }

  async findLatestByCustomerId(customerId: string): Promise<ElectricBill | null> {
    const bills = await this.billRepo.find({
      where: { customerId, isDeleted: false },
      order: { date: 'DESC' },
      take: 1,
    });
    return bills.length > 0 ? this.toDomain(bills[0]) : null;
  }

  async findPreviousBill(
    customerId: string,
    beforeDate: Date,
    excludeBillId?: string,
  ): Promise<ElectricBill | null> {
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

  async findSubsequentBills(
    customerId: string,
    afterDate: Date,
  ): Promise<ElectricBill[]> {
    const orms = await this.billRepo
      .createQueryBuilder('b')
      .where('b.customerId = :customerId', { customerId })
      .andWhere('b.date > :afterDate', { afterDate })
      .andWhere('b.isDeleted = :isDeleted', { isDeleted: false })
      .orderBy('b.date', 'ASC')
      .getMany();

    return orms.map((orm) => this.toDomain(orm));
  }

  async findByCompanyId(companyId: string): Promise<ElectricBill[]> {
    return this.getAllAsync({
      filter: { companyId },
      orderBy: { date: 'DESC' },
    });
  }

  async findByGarageId(companyId: string, garageId: string): Promise<ElectricBill[]> {
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

  protected toDomain(orm: ElectricBillOrmEntity): ElectricBill {
    return new ElectricBill({
      id: orm.id,
      billNumber: orm.billNumber,
      customerId: orm.customerId,
      companyId: orm.companyId,
      date: orm.date ? new Date(orm.date) : new Date(),
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

  protected toOrm(domain: ElectricBill): ElectricBillOrmEntity {
    const orm = new ElectricBillOrmEntity();
    orm.id = domain.id;
    orm.billNumber = domain.billNumber ?? 0;
    orm.customerId = domain.customerId;
    orm.companyId = domain.companyId;
    orm.date = domain.date;
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
}
