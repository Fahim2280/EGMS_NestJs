import { ICommandHandler } from '@nestjs/cqrs';
import { ConfigService } from '@nestjs/config';
import { ForgotPasswordCommand } from '../impl/forgot-password.command';
import { ICompanyRepository, IPasswordResetTokenRepository } from "../../../domain/index";
import { EmailService } from "../../../infrastructure/email/email.service";
export declare class ForgotPasswordHandler implements ICommandHandler<ForgotPasswordCommand> {
    private readonly companyRepo;
    private readonly tokenRepo;
    private readonly emailService;
    private readonly configService;
    private readonly logger;
    constructor(companyRepo: ICompanyRepository, tokenRepo: IPasswordResetTokenRepository, emailService: EmailService, configService: ConfigService);
    execute(command: ForgotPasswordCommand): Promise<{
        success: boolean;
        token?: string;
    }>;
}
