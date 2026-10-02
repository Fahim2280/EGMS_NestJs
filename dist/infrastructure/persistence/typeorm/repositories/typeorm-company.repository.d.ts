import { Repository } from 'typeorm';
import { Company, ICompanyRepository } from "../../../../domain/index";
import { CompanyOrmEntity } from '../entities/company.orm-entity';
import { GenericTypeOrmRepository } from './generic-typeorm.repository';
export declare class TypeOrmCompanyRepository extends GenericTypeOrmRepository<Company, CompanyOrmEntity> implements ICompanyRepository {
    private readonly companyRepo;
    constructor(companyRepo: Repository<CompanyOrmEntity>);
    findByEmail(email: string): Promise<Company | null>;
    protected toDomain(orm: CompanyOrmEntity): Company;
    protected toOrm(domain: Company): CompanyOrmEntity;
}
