import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryColumn,
} from 'typeorm';

@Entity('company_approval_tokens')
export class CompanyApprovalTokenOrmEntity {
  @PrimaryColumn('varchar', { length: 100 })
  id: string;

  @Index()
  @Column('varchar', { length: 100 })
  companyId: string;

  @Index({ unique: true })
  @Column('varchar', { length: 255 })
  token: string;

  @Column('datetime')
  expiresAt: Date;

  @Column({ type: 'boolean', default: false })
  isUsed: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
