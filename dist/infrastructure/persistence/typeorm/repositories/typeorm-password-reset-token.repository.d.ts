import { Repository } from 'typeorm';
import { PasswordResetToken, IPasswordResetTokenRepository } from "../../../../domain/index";
import { PasswordResetTokenOrmEntity } from '../entities/password-reset-token.orm-entity';
export declare class TypeOrmPasswordResetTokenRepository implements IPasswordResetTokenRepository {
    private readonly tokenRepo;
    constructor(tokenRepo: Repository<PasswordResetTokenOrmEntity>);
    save(token: PasswordResetToken): Promise<void>;
    findByTokenAndEmail(token: string, email: string): Promise<PasswordResetToken | null>;
    invalidateExistingTokens(email: string): Promise<void>;
}
