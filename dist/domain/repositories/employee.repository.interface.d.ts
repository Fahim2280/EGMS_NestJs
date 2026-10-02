import { Employee } from '../entities/employee.entity';
import { IGenericRepository } from './generic.repository.interface';
export declare const EMPLOYEE_REPOSITORY_TOKEN = "EMPLOYEE_REPOSITORY_TOKEN";
export interface IEmployeeRepository extends IGenericRepository<Employee> {
    findByEmail(email: string): Promise<Employee | null>;
    findByNid(nidNumber: string): Promise<Employee | null>;
    findByCompanyId(companyId: string): Promise<Employee[]>;
    countByCompanyId(companyId: string): Promise<number>;
    saveWithGarages(employee: Employee, garageIds: string[]): Promise<Employee>;
}
