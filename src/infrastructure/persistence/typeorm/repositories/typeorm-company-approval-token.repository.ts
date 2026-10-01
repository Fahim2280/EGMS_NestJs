import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CompanyApprovalToken,
  ICompanyApprovalTokenRepository,
} from '@domain/index';
import { CompanyApprovalTokenOrmEntity } from '../entities/company-approval-token.orm-entity';

@Injectable()
export class TypeOrmCompanyApprovalTokenRepository
  implements ICompanyApprovalTokenRepository
{
  constructor(
    @InjectRepository(CompanyApprovalTokenOrmEntity)
    private readonly repo: Repository<CompanyApprovalTokenOrmEntity>,
  ) {}

  async save(token: CompanyApprovalToken): Promise<void> {
    const orm = new CompanyApprovalTokenOrmEntity();
    orm.id = token.id;
    orm.companyId = token.companyId;
    orm.token = token.token;
    orm.expiresAt = token.expiresAt;
    orm.isUsed = token.isUsed;
    await this.repo.save(orm);
  }

  async findByToken(token: string): Promise<CompanyApprovalToken | null> {
    const orm = await this.repo.findOne({ where: { token } });
    if (!orm) return null;
    return new CompanyApprovalToken({
      id: orm.id,
      companyId: orm.companyId,
      token: orm.token,
      expiresAt: orm.expiresAt,
      isUsed: orm.isUsed,
      createdAt: orm.createdAt,
    });
  }

  async markUsed(id: string): Promise<void> {
    await this.repo.update({ id }, { isUsed: true });
  }
}
