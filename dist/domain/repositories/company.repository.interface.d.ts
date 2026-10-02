import { Company } from '../entities/company.entity';
import { IGenericRepository } from './generic.repository.interface';
export declare const COMPANY_REPOSITORY_TOKEN = "COMPANY_REPOSITORY_TOKEN";
export interface ICompanyRepository extends IGenericRepository<Company> {
    findByEmail(email: string): Promise<Company | null>;
}
