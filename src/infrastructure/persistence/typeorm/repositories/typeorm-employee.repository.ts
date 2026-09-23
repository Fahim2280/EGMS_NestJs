import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Employee, IEmployeeRepository } from '@domain/index';
import { EmployeeOrmEntity } from '../entities/employee.orm-entity';
import { GarageOrmEntity } from '../entities/garage.orm-entity';
import { GenericTypeOrmRepository } from './generic-typeorm.repository';

@Injectable()
export class TypeOrmEmployeeRepository
  extends GenericTypeOrmRepository<Employee, EmployeeOrmEntity>
  implements IEmployeeRepository
{
  constructor(
    @InjectRepository(EmployeeOrmEntity)
    private readonly employeeRepo: Repository<EmployeeOrmEntity>,
    @InjectRepository(GarageOrmEntity)
    private readonly garageRepo: Repository<GarageOrmEntity>,
  ) {
    super(employeeRepo);
  }

  async findByEmail(email: string): Promise<Employee | null> {
    const orm = await this.employeeRepo.findOne({
      where: { email: email.trim().toLowerCase(), isDeleted: false },
      relations: { permittedGarages: true },
    });
    return orm ? this.toDomain(orm) : null;
  }

  async findByNid(nidNumber: string): Promise<Employee | null> {
    const orm = await this.employeeRepo.findOne({
      where: { nidNumber: nidNumber.trim(), isDeleted: false },
      relations: { permittedGarages: true },
    });
    return orm ? this.toDomain(orm) : null;
  }

  async findByCompanyId(companyId: string): Promise<Employee[]> {
    const orms = await this.employeeRepo.find({
      where: { companyId, isDeleted: false },
      relations: { permittedGarages: true },
      order: { createdDate: 'DESC' },
    });
    return orms.map((orm) => this.toDomain(orm));
  }

  override async findById(id: string): Promise<Employee | null> {
    const orm = await this.employeeRepo.findOne({
      where: { id, isDeleted: false },
      relations: { permittedGarages: true },
    });
    return orm ? this.toDomain(orm) : null;
  }

  async countByCompanyId(companyId: string): Promise<number> {
    return this.countAsync({ companyId });
  }

  async saveWithGarages(employee: Employee, garageIds: string[]): Promise<Employee> {
    const orm = this.toOrm(employee);
    if (garageIds && Array.isArray(garageIds)) {
      if (garageIds.length > 0) {
        orm.permittedGarages = await this.garageRepo.findBy({
          id: In(garageIds),
          companyId: employee.companyId,
          isDeleted: false,
        });
      } else {
        orm.permittedGarages = [];
      }
    }
    const saved = await this.employeeRepo.save(orm);
    return this.toDomain(saved);
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

  protected toOrm(domain: Employee): EmployeeOrmEntity {
    const orm = new EmployeeOrmEntity();
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
}
