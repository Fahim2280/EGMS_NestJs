import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryColumn,
} from 'typeorm';

@Entity('password_reset_tokens')
export class PasswordResetTokenOrmEntity {
  @PrimaryColumn('varchar', { length: 100 })
  id: string;

  @Index()
  @Column({ length: 150 })
  email: string;

  @Index({ unique: true })
  @Column({ length: 255 })
  token: string;

  @Column('datetime')
  expiresAt: Date;

  @Column({ type: 'boolean', default: false })
  isUsed: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
