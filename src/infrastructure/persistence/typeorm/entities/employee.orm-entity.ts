import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { AutoMap } from '@automapper/classes';
import { BaseAuditableOrmEntity } from './base-auditable.orm-entity';
import { CompanyOrmEntity } from './company.orm-entity';

@Entity('employees')
export class EmployeeOrmEntity extends BaseAuditableOrmEntity {
  @AutoMap()
  @PrimaryColumn('varchar', { length: 100 })
  id: string;

  @AutoMap()
  @Column('varchar', { length: 100 })
  companyId: string;

  @AutoMap()
  @Column({ length: 100 })
  name: string;

  @AutoMap()
  @Column('text')
  address: string;

  @AutoMap()
  @Index({ unique: true })
  @Column({ length: 150 })
  email: string;

  @Column({ length: 255 })
  password: string;

  @AutoMap()
  @Column({ length: 30 })
  phoneNumber: string;

  @AutoMap()
  @Column({ type: 'varchar', length: 20, default: 'GENERAL' })
  role: string;

  @AutoMap()
  @Index({ unique: true })
  @Column({ length: 50 })
  nidNumber: string;

  @ManyToOne(() => CompanyOrmEntity, (company) => company.employees, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'companyId' })
  company: CompanyOrmEntity;
}
