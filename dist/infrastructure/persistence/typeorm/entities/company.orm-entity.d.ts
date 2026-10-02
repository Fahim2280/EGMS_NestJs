import { BaseAuditableOrmEntity } from './base-auditable.orm-entity';
import { GarageOrmEntity } from './garage.orm-entity';
import { EmployeeOrmEntity } from './employee.orm-entity';
export declare class CompanyOrmEntity extends BaseAuditableOrmEntity {
    id: string;
    name: string;
    companyName: string;
    email: string;
    password: string;
    phoneNumber: string;
    role: string;
    address: string;
    unitRate: number;
    registrationStatus: string;
    garages: GarageOrmEntity[];
    employees: EmployeeOrmEntity[];
    customers: any[];
}
