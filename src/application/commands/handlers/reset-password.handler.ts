import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException, Inject, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { ResetPasswordCommand } from '../impl/reset-password.command';
import {
  COMPANY_REPOSITORY_TOKEN,
  ICompanyRepository,
  PASSWORD_RESET_TOKEN_REPOSITORY_TOKEN,
  IPasswordResetTokenRepository,
} from '@domain/index';

@CommandHandler(ResetPasswordCommand)
export class ResetPasswordHandler implements ICommandHandler<ResetPasswordCommand> {
  constructor(
    @Inject(COMPANY_REPOSITORY_TOKEN)
    private readonly companyRepo: ICompanyRepository,
    @Inject(PASSWORD_RESET_TOKEN_REPOSITORY_TOKEN)
    private readonly tokenRepo: IPasswordResetTokenRepository,
  ) {}

  async execute(command: ResetPasswordCommand): Promise<boolean> {
    const { email, token, newPassword } = command;
    const normalizedEmail = email.trim().toLowerCase();

    const resetToken = await this.tokenRepo.findByTokenAndEmail(token, normalizedEmail);
    if (!resetToken || !resetToken.isValid()) {
      throw new BadRequestException('This password reset link is invalid or has expired.');
    }

    const company = await this.companyRepo.findByEmail(normalizedEmail);
    if (!company) {
      throw new NotFoundException('Account not found.');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    company.updatePassword(hashedPassword, `${company.id}|PASSWORD_RESET`);
    await this.companyRepo.updateAsync(company);

    resetToken.markUsed();
    await this.tokenRepo.save(resetToken);

    return true;
  }
}
