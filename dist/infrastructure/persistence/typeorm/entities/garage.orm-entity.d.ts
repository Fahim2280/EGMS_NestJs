import { BaseAuditableOrmEntity } from './base-auditable.orm-entity';
import { CompanyOrmEntity } from './company.orm-entity';
import { CustomerOrmEntity } from './customer.orm-entity';
import { EmployeeOrmEntity } from './employee.orm-entity';
export declare class GarageOrmEntity extends BaseAuditableOrmEntity {
    id: string;
    garageName: string;
    address: string;
    companyId: string;
    company: CompanyOrmEntity;
    customers: CustomerOrmEntity[];
    employees: EmployeeOrmEntity[];
}
