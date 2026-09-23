import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer, ICustomerRepository } from '@domain/index';
import { CustomerOrmEntity } from '../entities/customer.orm-entity';
import { GenericTypeOrmRepository } from './generic-typeorm.repository';

@Injectable()
export class TypeOrmCustomerRepository
  extends GenericTypeOrmRepository<Customer, CustomerOrmEntity>
  implements ICustomerRepository
{
  constructor(
    @InjectRepository(CustomerOrmEntity)
    private readonly customerRepo: Repository<CustomerOrmEntity>,
  ) {
    super(customerRepo);
  }

  async findByCompanyId(companyId: string): Promise<Customer[]> {
    const orms = await this.customerRepo.find({
      where: { companyId, isDeleted: false },
      relations: { garage: true },
      order: { createdDate: 'DESC' },
    });
    return orms.map((orm) => this.toDomain(orm));
  }

  async findByGarageId(companyId: string, garageId: string): Promise<Customer[]> {
    const orms = await this.customerRepo.find({
      where: { companyId, garageId, isDeleted: false },
      relations: { garage: true },
      order: { createdDate: 'DESC' },
    });
    return orms.map((orm) => this.toDomain(orm));
  }

  async countByGarageId(companyId: string, garageId: string): Promise<number> {
    return this.customerRepo.count({
      where: { companyId, garageId, isDeleted: false },
    });
  }

  async getByIdAsync(id: string): Promise<Customer | null> {
    const orm = await this.customerRepo.findOne({
      where: { id },
      relations: { garage: true },
    });
    return orm ? this.toDomain(orm) : null;
  }

  async findByNid(
    companyId: string,
    nid: string,
    excludeId?: string,
  ): Promise<Customer | null> {
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

  async findByMobile(
    companyId: string,
    mobile: string,
    excludeId?: string,
  ): Promise<Customer | null> {
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

  async findByCustomerCode(
    companyId: string,
    code: string,
    excludeId?: string,
  ): Promise<Customer | null> {
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

  async countByCompanyId(companyId: string): Promise<number> {
    return this.customerRepo.count({
      where: { companyId, isDeleted: false },
    });
  }

  protected toDomain(orm: CustomerOrmEntity): Customer {
    return new Customer({
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

  protected toOrm(domain: Customer): CustomerOrmEntity {
    const orm = new CustomerOrmEntity();
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
}
