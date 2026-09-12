import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company, ICompanyRepository } from '@domain/index';
import { CompanyOrmEntity } from '../entities/company.orm-entity';
import { GenericTypeOrmRepository } from './generic-typeorm.repository';

@Injectable()
export class TypeOrmCompanyRepository
  extends GenericTypeOrmRepository<Company, CompanyOrmEntity>
  implements ICompanyRepository
{
  constructor(
    @InjectRepository(CompanyOrmEntity)
    private readonly companyRepo: Repository<CompanyOrmEntity>,
  ) {
    super(companyRepo);
  }

  async findByEmail(email: string): Promise<Company | null> {
    return this.getFirstOrDefaultAsync({ email: email.trim().toLowerCase() });
  }

  protected toDomain(orm: CompanyOrmEntity): Company {
    return new Company({
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
      createdDate: orm.createdDate ? new Date(orm.createdDate) : new Date(),
      modifiedDate: orm.modifiedDate ? new Date(orm.modifiedDate) : undefined,
      deletedDate: orm.deletedDate ? new Date(orm.deletedDate) : undefined,
    });
  }

  protected toOrm(domain: Company): CompanyOrmEntity {
    const orm = new CompanyOrmEntity();
    orm.id = domain.id;
    orm.name = domain.name;
    orm.companyName = domain.companyName;
    orm.email = domain.email;
    orm.password = domain.password;
    orm.phoneNumber = domain.phoneNumber;
    orm.role = domain.role;
    orm.address = domain.address;
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
