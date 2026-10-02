import { OnApplicationBootstrap } from '@nestjs/common';
import { Repository } from 'typeorm';
import { CompanyOrmEntity } from './entities/company.orm-entity';
import { GarageOrmEntity } from './entities/garage.orm-entity';
import { EmployeeOrmEntity } from './entities/employee.orm-entity';
import { CustomerOrmEntity } from './entities/customer.orm-entity';
import { ElectricBillOrmEntity } from './entities/electric-bill.orm-entity';
import { GuarantorOrmEntity } from './entities/guarantor.orm-entity';
export declare class DatabaseSeederService implements OnApplicationBootstrap {
    private readonly companyRepo;
    private readonly garageRepo;
    private readonly employeeRepo;
    private readonly customerRepo;
    private readonly billRepo;
    private readonly guarantorRepo;
    private readonly logger;
    constructor(companyRepo: Repository<CompanyOrmEntity>, garageRepo: Repository<GarageOrmEntity>, employeeRepo: Repository<EmployeeOrmEntity>, customerRepo: Repository<CustomerOrmEntity>, billRepo: Repository<ElectricBillOrmEntity>, guarantorRepo: Repository<GuarantorOrmEntity>);
    onApplicationBootstrap(): Promise<void>;
    seed(): Promise<void>;
    private seedCustomersAndBills;
    private syncDemoGaragesAndPermissions;
}
