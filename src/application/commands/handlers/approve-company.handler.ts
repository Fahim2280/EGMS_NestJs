import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException, Inject, NotFoundException } from '@nestjs/common';
import { ApproveCompanyCommand } from '../impl/approve-company.command';
import {
  COMPANY_APPROVAL_TOKEN_REPOSITORY_TOKEN,
  ICompanyApprovalTokenRepository,
  COMPANY_REPOSITORY_TOKEN,
  ICompanyRepository,
} from '@domain/index';
import { EmailService } from '@infrastructure/email/email.service';

@CommandHandler(ApproveCompanyCommand)
export class ApproveCompanyHandler
  implements ICommandHandler<ApproveCompanyCommand>
{
  constructor(
    @Inject(COMPANY_APPROVAL_TOKEN_REPOSITORY_TOKEN)
    private readonly approvalTokenRepo: ICompanyApprovalTokenRepository,
    @Inject(COMPANY_REPOSITORY_TOKEN)
    private readonly companyRepo: ICompanyRepository,
    private readonly emailService: EmailService,
  ) {}

  async execute(command: ApproveCompanyCommand): Promise<void> {
    const { token } = command;

    // 1. Find and validate the approval token
    const approvalToken = await this.approvalTokenRepo.findByToken(token);
    if (!approvalToken) {
      throw new NotFoundException('Invalid approval token.');
    }
    if (!approvalToken.isValid()) {
      throw new BadRequestException(
        'This approval link has already been used or has expired.',
      );
    }

    // 2. Find the company
    const company = await this.companyRepo.findById(approvalToken.companyId);
    if (!company) {
      throw new NotFoundException('Company not found for this token.');
    }

    // 3. Activate the company
    company.approve();
    await this.companyRepo.save(company);

    // 4. Mark token as used
    await this.approvalTokenRepo.markUsed(approvalToken.id);

    // 5. Send welcome email to the newly approved company (fire-and-forget)
    this.emailService.sendWelcomeEmail(company.email, company.companyName).catch(() => {});
  }
}
