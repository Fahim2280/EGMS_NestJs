import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Employee, IEmployeeRepository } from '@domain/index';
import { EmployeeOrmEntity } from '../entities/employee.orm-entity';
import { GenericTypeOrmRepository } from './generic-typeorm.repository';

@Injectable()
export class TypeOrmEmployeeRepository
  extends GenericTypeOrmRepository<Employee, EmployeeOrmEntity>
  implements IEmployeeRepository
{
  constructor(
    @InjectRepository(EmployeeOrmEntity)
    private readonly employeeRepo: Repository<EmployeeOrmEntity>,
  ) {
    super(employeeRepo);
  }

  async findByEmail(email: string): Promise<Employee | null> {
    return this.getFirstOrDefaultAsync({ email: email.trim().toLowerCase() });
  }

  async findByNid(nidNumber: string): Promise<Employee | null> {
    return this.getFirstOrDefaultAsync({ nidNumber: nidNumber.trim() });
  }

  async findByCompanyId(companyId: string): Promise<Employee[]> {
    return this.getAllAsync({ filter: { companyId } });
  }

  async countByCompanyId(companyId: string): Promise<number> {
    return this.countAsync({ companyId });
  }

  protected toDomain(orm: EmployeeOrmEntity): Employee {
    return new Employee({
      id: orm.id,
      companyId: orm.companyId,
      name: orm.name,
      address: orm.address,
      email: orm.email,
      password: orm.password,
      phoneNumber: orm.phoneNumber,
      role: orm.role,
      nidNumber: orm.nidNumber,
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

  protected toOrm(domain: Employee): EmployeeOrmEntity {
    const orm = new EmployeeOrmEntity();
    orm.id = domain.id;
    orm.companyId = domain.companyId;
    orm.name = domain.name;
    orm.address = domain.address;
    orm.email = domain.email;
    orm.password = domain.password;
    orm.phoneNumber = domain.phoneNumber;
    orm.role = domain.role;
    orm.nidNumber = domain.nidNumber;
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
