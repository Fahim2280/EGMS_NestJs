import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import * as crypto from 'crypto';
import { ForgotPasswordCommand } from '../impl/forgot-password.command';
import {
  COMPANY_REPOSITORY_TOKEN,
  ICompanyRepository,
  PASSWORD_RESET_TOKEN_REPOSITORY_TOKEN,
  IPasswordResetTokenRepository,
  PasswordResetToken,
} from '@domain/index';
import { EmailService } from '@infrastructure/email/email.service';

@CommandHandler(ForgotPasswordCommand)
export class ForgotPasswordHandler implements ICommandHandler<ForgotPasswordCommand> {
  private readonly logger = new Logger(ForgotPasswordHandler.name);

  constructor(
    @Inject(COMPANY_REPOSITORY_TOKEN)
    private readonly companyRepo: ICompanyRepository,
    @Inject(PASSWORD_RESET_TOKEN_REPOSITORY_TOKEN)
    private readonly tokenRepo: IPasswordResetTokenRepository,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {}

  async execute(command: ForgotPasswordCommand): Promise<{ success: boolean; token?: string }> {
    const { email } = command;
    const normalizedEmail = email.trim().toLowerCase();

    const company = await this.companyRepo.findByEmail(normalizedEmail);
    if (!company) {
      // Do not leak email existence for security, return success
      return { success: true };
    }

    await this.tokenRepo.invalidateExistingTokens(normalizedEmail);

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour validity

    const resetToken = new PasswordResetToken({
      id: uuidv4(),
      email: normalizedEmail,
      token,
      expiresAt,
    });

    await this.tokenRepo.save(resetToken);

    const appUrl =
      this.configService.get<string>('APP_URL') ||
      process.env.APP_URL ||
      'https://localhost:3000';
    const resetLink = `${appUrl}/reset-password?token=${token}&email=${encodeURIComponent(normalizedEmail)}`;

    // Send real password reset email
    await this.emailService.sendPasswordResetEmail(normalizedEmail, resetLink);

    return { success: true, token };
  }
}
