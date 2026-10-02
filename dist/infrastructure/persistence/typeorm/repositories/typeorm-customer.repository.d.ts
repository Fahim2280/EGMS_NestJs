import { Repository } from 'typeorm';
import { Customer, ICustomerRepository } from "../../../../domain/index";
import { CustomerOrmEntity } from '../entities/customer.orm-entity';
import { GenericTypeOrmRepository } from './generic-typeorm.repository';
export declare class TypeOrmCustomerRepository extends GenericTypeOrmRepository<Customer, CustomerOrmEntity> implements ICustomerRepository {
    private readonly customerRepo;
    constructor(customerRepo: Repository<CustomerOrmEntity>);
    findByCompanyId(companyId: string): Promise<Customer[]>;
    findByGarageId(companyId: string, garageId: string): Promise<Customer[]>;
    countByGarageId(companyId: string, garageId: string): Promise<number>;
    getByIdAsync(id: string): Promise<Customer | null>;
    findByNid(companyId: string, nid: string, excludeId?: string): Promise<Customer | null>;
    findByMobile(companyId: string, mobile: string, excludeId?: string): Promise<Customer | null>;
    findByCustomerCode(companyId: string, code: string, excludeId?: string): Promise<Customer | null>;
    countByCompanyId(companyId: string): Promise<number>;
    protected toDomain(orm: CustomerOrmEntity): Customer;
    protected toOrm(domain: Customer): CustomerOrmEntity;
}
