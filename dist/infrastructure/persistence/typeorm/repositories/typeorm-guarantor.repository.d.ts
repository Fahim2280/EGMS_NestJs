import { Repository } from 'typeorm';
import { Guarantor, IGuarantorRepository } from "../../../../domain/index";
import { GuarantorOrmEntity } from '../entities/guarantor.orm-entity';
import { GenericTypeOrmRepository } from './generic-typeorm.repository';
export declare class TypeOrmGuarantorRepository extends GenericTypeOrmRepository<Guarantor, GuarantorOrmEntity> implements IGuarantorRepository {
    private readonly guarantorRepo;
    constructor(guarantorRepo: Repository<GuarantorOrmEntity>);
    findByCustomerId(customerId: string): Promise<Guarantor[]>;
    findByEmployeeId(employeeId: string): Promise<Guarantor[]>;
    findByCompanyId(companyId: string): Promise<Guarantor[]>;
    countByCustomerId(customerId: string): Promise<number>;
    countByEmployeeId(employeeId: string): Promise<number>;
    findByCustomerAndNid(customerId: string, nidNumber: string, excludeId?: string): Promise<Guarantor | null>;
    findByEmployeeAndNid(employeeId: string, nidNumber: string, excludeId?: string): Promise<Guarantor | null>;
    protected toDomain(orm: GuarantorOrmEntity): Guarantor;
    protected toOrm(domain: Guarantor): GuarantorOrmEntity;
}
