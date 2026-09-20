import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  PasswordResetToken,
  IPasswordResetTokenRepository,
} from '@domain/index';
import { PasswordResetTokenOrmEntity } from '../entities/password-reset-token.orm-entity';

@Injectable()
export class TypeOrmPasswordResetTokenRepository
  implements IPasswordResetTokenRepository
{
  constructor(
    @InjectRepository(PasswordResetTokenOrmEntity)
    private readonly tokenRepo: Repository<PasswordResetTokenOrmEntity>,
  ) {}

  async save(token: PasswordResetToken): Promise<void> {
    const orm = new PasswordResetTokenOrmEntity();
    orm.id = token.id;
    orm.email = token.email;
    orm.token = token.token;
    orm.expiresAt = token.expiresAt;
    orm.isUsed = token.isUsed;
    await this.tokenRepo.save(orm);
  }

  async findByTokenAndEmail(
    token: string,
    email: string,
  ): Promise<PasswordResetToken | null> {
    const orm = await this.tokenRepo.findOne({
      where: {
        token,
        email: email.trim().toLowerCase(),
      },
    });

    if (!orm) return null;

    return new PasswordResetToken({
      id: orm.id,
      email: orm.email,
      token: orm.token,
      expiresAt: orm.expiresAt,
      isUsed: orm.isUsed,
      createdAt: orm.createdAt,
    });
  }

  async invalidateExistingTokens(email: string): Promise<void> {
    await this.tokenRepo.update(
      { email: email.trim().toLowerCase() },
      { isUsed: true },
    );
  }
}
