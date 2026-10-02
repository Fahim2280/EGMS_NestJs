import { Repository } from 'typeorm';
import { CompanyApprovalToken, ICompanyApprovalTokenRepository } from "../../../../domain/index";
import { CompanyApprovalTokenOrmEntity } from '../entities/company-approval-token.orm-entity';
export declare class TypeOrmCompanyApprovalTokenRepository implements ICompanyApprovalTokenRepository {
    private readonly repo;
    constructor(repo: Repository<CompanyApprovalTokenOrmEntity>);
    save(token: CompanyApprovalToken): Promise<void>;
    findByToken(token: string): Promise<CompanyApprovalToken | null>;
    markUsed(id: string): Promise<void>;
}
