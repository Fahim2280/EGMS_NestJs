import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Guarantor, IGuarantorRepository } from '@domain/index';
import { GuarantorOrmEntity } from '../entities/guarantor.orm-entity';
import { GenericTypeOrmRepository } from './generic-typeorm.repository';

@Injectable()
export class TypeOrmGuarantorRepository
  extends GenericTypeOrmRepository<Guarantor, GuarantorOrmEntity>
  implements IGuarantorRepository
{
  constructor(
    @InjectRepository(GuarantorOrmEntity)
    private readonly guarantorRepo: Repository<GuarantorOrmEntity>,
  ) {
    super(guarantorRepo);
  }

  async findByCustomerId(customerId: string): Promise<Guarantor[]> {
    const orms = await this.guarantorRepo.find({
      where: { customerId, isDeleted: false },
      order: { createdDate: 'ASC' },
    });
    return orms.map((orm) => this.toDomain(orm));
  }

  async findByEmployeeId(employeeId: string): Promise<Guarantor[]> {
    const orms = await this.guarantorRepo.find({
      where: { employeeId, isDeleted: false },
      order: { createdDate: 'ASC' },
    });
    return orms.map((orm) => this.toDomain(orm));
  }

  async findByCompanyId(companyId: string): Promise<Guarantor[]> {
    const orms = await this.guarantorRepo.find({
      where: { companyId, isDeleted: false },
      order: { createdDate: 'DESC' },
    });
    return orms.map((orm) => this.toDomain(orm));
  }

  async countByCustomerId(customerId: string): Promise<number> {
    return this.guarantorRepo.count({
      where: { customerId, isDeleted: false },
    });
  }

  async countByEmployeeId(employeeId: string): Promise<number> {
    return this.guarantorRepo.count({
      where: { employeeId, isDeleted: false },
    });
  }

  async findByCustomerAndNid(
    customerId: string,
    nidNumber: string,
    excludeId?: string,
  ): Promise<Guarantor | null> {
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

  async findByEmployeeAndNid(
    employeeId: string,
    nidNumber: string,
    excludeId?: string,
  ): Promise<Guarantor | null> {
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

  protected toDomain(orm: GuarantorOrmEntity): Guarantor {
    return new Guarantor({
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

  protected toOrm(domain: Guarantor): GuarantorOrmEntity {
    const orm = new GuarantorOrmEntity();
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
}
