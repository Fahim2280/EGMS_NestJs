import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException, Inject, NotFoundException } from '@nestjs/common';
import { RejectCompanyCommand } from '../impl/reject-company.command';
import {
  COMPANY_APPROVAL_TOKEN_REPOSITORY_TOKEN,
  ICompanyApprovalTokenRepository,
  COMPANY_REPOSITORY_TOKEN,
  ICompanyRepository,
} from '@domain/index';

@CommandHandler(RejectCompanyCommand)
export class RejectCompanyHandler
  implements ICommandHandler<RejectCompanyCommand>
{
  constructor(
    @Inject(COMPANY_APPROVAL_TOKEN_REPOSITORY_TOKEN)
    private readonly approvalTokenRepo: ICompanyApprovalTokenRepository,
    @Inject(COMPANY_REPOSITORY_TOKEN)
    private readonly companyRepo: ICompanyRepository,
  ) {}

  async execute(command: RejectCompanyCommand): Promise<void> {
    const { token } = command;

    // 1. Find and validate the approval token
    const approvalToken = await this.approvalTokenRepo.findByToken(token);
    if (!approvalToken) {
      throw new NotFoundException('Invalid approval token.');
    }
    if (!approvalToken.isValid()) {
      throw new BadRequestException(
        'This rejection link has already been used or has expired.',
      );
    }

    // 2. Find the company
    const company = await this.companyRepo.findById(approvalToken.companyId);
    if (!company) {
      // Token already consumed or company already deleted — mark used and exit gracefully
      await this.approvalTokenRepo.markUsed(approvalToken.id);
      return;
    }

    // 3. Mark token as used BEFORE deleting (so second clicks fail gracefully)
    await this.approvalTokenRepo.markUsed(approvalToken.id);

    // 4. Hard-delete the company (cascades to garages, employees, customers via TypeORM)
    await this.companyRepo.delete(company.id);
  }
}
