import { ICommandHandler } from '@nestjs/cqrs';
import { ConfigService } from '@nestjs/config';
import { RegisterCompanyCommand } from '../impl/register-company.command';
import { Company, ICompanyRepository, IGarageRepository, ICompanyApprovalTokenRepository } from "../../../domain/index";
import { EmailService } from "../../../infrastructure/email/email.service";
export declare class RegisterCompanyHandler implements ICommandHandler<RegisterCompanyCommand> {
    private readonly companyRepo;
    private readonly garageRepo;
    private readonly approvalTokenRepo;
    private readonly emailService;
    private readonly config;
    constructor(companyRepo: ICompanyRepository, garageRepo: IGarageRepository, approvalTokenRepo: ICompanyApprovalTokenRepository, emailService: EmailService, config: ConfigService);
    execute(command: RegisterCompanyCommand): Promise<Company>;
}
