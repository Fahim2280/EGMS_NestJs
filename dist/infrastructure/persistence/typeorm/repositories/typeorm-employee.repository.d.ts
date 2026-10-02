import { Repository } from 'typeorm';
import { Employee, IEmployeeRepository } from "../../../../domain/index";
import { EmployeeOrmEntity } from '../entities/employee.orm-entity';
import { GarageOrmEntity } from '../entities/garage.orm-entity';
import { GenericTypeOrmRepository } from './generic-typeorm.repository';
export declare class TypeOrmEmployeeRepository extends GenericTypeOrmRepository<Employee, EmployeeOrmEntity> implements IEmployeeRepository {
    private readonly employeeRepo;
    private readonly garageRepo;
    constructor(employeeRepo: Repository<EmployeeOrmEntity>, garageRepo: Repository<GarageOrmEntity>);
    findByEmail(email: string): Promise<Employee | null>;
    findByNid(nidNumber: string): Promise<Employee | null>;
    findByCompanyId(companyId: string): Promise<Employee[]>;
    findById(id: string): Promise<Employee | null>;
    countByCompanyId(companyId: string): Promise<number>;
    saveWithGarages(employee: Employee, garageIds: string[]): Promise<Employee>;
    protected toDomain(orm: EmployeeOrmEntity): Employee;
    protected toOrm(domain: Employee): EmployeeOrmEntity;
}
