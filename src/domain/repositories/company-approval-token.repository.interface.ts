import { CompanyApprovalToken } from '../entities/company-approval-token.entity';

export const COMPANY_APPROVAL_TOKEN_REPOSITORY_TOKEN = 'COMPANY_APPROVAL_TOKEN_REPOSITORY_TOKEN';

export interface ICompanyApprovalTokenRepository {
  save(token: CompanyApprovalToken): Promise<void>;
  findByToken(token: string): Promise<CompanyApprovalToken | null>;
  markUsed(id: string): Promise<void>;
}
