import { ICommandHandler } from '@nestjs/cqrs';
import { ApproveCompanyCommand } from '../impl/approve-company.command';
import { ICompanyApprovalTokenRepository, ICompanyRepository } from "../../../domain/index";
import { EmailService } from "../../../infrastructure/email/email.service";
export declare class ApproveCompanyHandler implements ICommandHandler<ApproveCompanyCommand> {
    private readonly approvalTokenRepo;
    private readonly companyRepo;
    private readonly emailService;
    constructor(approvalTokenRepo: ICompanyApprovalTokenRepository, companyRepo: ICompanyRepository, emailService: EmailService);
    execute(command: ApproveCompanyCommand): Promise<void>;
}
