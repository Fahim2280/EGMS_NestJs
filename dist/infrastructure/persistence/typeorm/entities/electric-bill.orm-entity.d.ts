import { BaseAuditableOrmEntity } from './base-auditable.orm-entity';
import { CompanyOrmEntity } from './company.orm-entity';
import { CustomerOrmEntity } from './customer.orm-entity';
export declare class ElectricBillOrmEntity extends BaseAuditableOrmEntity {
    id: string;
    billNumber: number;
    customerId: string;
    companyId: string;
    date: Date;
    fromDate?: Date;
    previousUnit: number;
    currentUnit: number;
    totalUnit: number;
    electricBill: number;
    unitRate: number;
    previousDues: number;
    rentBill: number;
    loan: number;
    totalBill: number;
    clearMoney: number;
    presentDues: number;
    customer: CustomerOrmEntity;
    company: CompanyOrmEntity;
}
