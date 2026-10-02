import { ICommandHandler } from '@nestjs/cqrs';
import { ResetPasswordCommand } from '../impl/reset-password.command';
import { ICompanyRepository, IPasswordResetTokenRepository } from "../../../domain/index";
export declare class ResetPasswordHandler implements ICommandHandler<ResetPasswordCommand> {
    private readonly companyRepo;
    private readonly tokenRepo;
    constructor(companyRepo: ICompanyRepository, tokenRepo: IPasswordResetTokenRepository);
    execute(command: ResetPasswordCommand): Promise<boolean>;
}
