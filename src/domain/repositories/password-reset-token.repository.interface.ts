import { PasswordResetToken } from '../entities/password-reset-token.entity';

export const PASSWORD_RESET_TOKEN_REPOSITORY_TOKEN = 'PASSWORD_RESET_TOKEN_REPOSITORY_TOKEN';

export interface IPasswordResetTokenRepository {
  save(token: PasswordResetToken): Promise<void>;
  findByTokenAndEmail(token: string, email: string): Promise<PasswordResetToken | null>;
  invalidateExistingTokens(email: string): Promise<void>;
}
