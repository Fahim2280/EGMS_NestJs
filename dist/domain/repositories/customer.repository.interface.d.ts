import { Customer } from '../entities/customer.entity';
import { IGenericRepository } from './generic.repository.interface';
export declare const CUSTOMER_REPOSITORY_TOKEN = "CUSTOMER_REPOSITORY_TOKEN";
export interface ICustomerRepository extends IGenericRepository<Customer> {
    findByCompanyId(companyId: string): Promise<Customer[]>;
    findByNid(companyId: string, nid: string, excludeId?: string): Promise<Customer | null>;
    findByMobile(companyId: string, mobile: string, excludeId?: string): Promise<Customer | null>;
    findByCustomerCode(companyId: string, code: string, excludeId?: string): Promise<Customer | null>;
    findByGarageId(companyId: string, garageId: string): Promise<Customer[]>;
    countByCompanyId(companyId: string): Promise<number>;
    countByGarageId(companyId: string, garageId: string): Promise<number>;
}
